const { validationResult } = require('express-validator');

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts =>{
        res.status(200).json({message:"Posts found", posts: posts})
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
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/duck.jpg',
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

exports.getPost = (req, res, next) =>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Post not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Post found",
            post: post
        })
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}