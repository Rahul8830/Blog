const { validationResult } = require('express-validator');
const fs = require("fs");
const path = require("path");

const Post = require("../models/post");

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
            res.status(200).json({ message: "Posts found", posts: posts, totalItems:totalPosts })
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
    console.log(req.file);
    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { name: 'Rahul' }
    });
    post.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Post Created",
                post: result
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
            clearPath(post.imageUrl);
            return Post.findByIdAndRemove(postId);
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

const clearPath = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}