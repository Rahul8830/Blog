const { validationResult } = require('express-validator');
const fs = require("fs");
const path = require("path");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
    const pageNo = req.query.page || 1;
    let totalPosts;
    const postPerPage = 2;
    console.log(pageNo);
    Post.find().countDocuments()
        .then(count => {
            totalPosts = count;
            return Post.find()
                .skip((pageNo - 1) * postPerPage)
                .limit(postPerPage)
        })
        .then(posts => {
            res.status(200).json({ message: "Posts found", posts: posts, totalItems: totalPosts })
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let err = new Error('Validation Failed. Please check the data entered');
        err.statusCode = 422;
        throw err;
    }
    if (!req.file) {
        let err = new Error('Image not uploaded.');
        err.statusCode = 422;
        throw err;
    }
    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Post Created",
                post: post,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post not found.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: "Post found",
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let err = new Error('Validation Failed. Please check the data entered');
        err.statusCode = 422;
        throw err;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new Error("No file picked.");
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post not found.');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not Authorized.');
                error.statusCode = 403;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                clearPath(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Post Updated.', post: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not Authorized.');
                error.statusCode = 403;
                throw error;
            }
            clearPath(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: "Post Deleted." });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updateStatus = (req, res, next) => {
    const status = req.body.statusData;
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            user.status = status;
            user.save();
        })
        .then(result =>{
            res.status(200).json({message: "Status updated"});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearPath = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}