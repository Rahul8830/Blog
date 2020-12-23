const { validationResult } = require('express-validator')

exports.getPost = (req, res, next) => {
    res.status(200).json({
        posts: [{ _id:'1',title: 'First post', content: 'This is a post', imageUrl:'images/Yellow_Duck.jpg', creator:{name:"Rahul"}, createdAt: new Date() }]
    })
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
       return res.status(422).json({message: 'Validation Failed. Please check the data entered', errors:errors.array()});
    }
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
        message: "Post Created",
        post: { _id: new Date().toISOString(), title: title, content: content,creator:{name:"Rahul"}, createdAt: new Date()  }
    })
}