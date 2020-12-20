exports.getPost = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'First post', content: 'This is a post' }]
    })
};

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
        message: "Post Created",
        post: { id: new Date().toISOString(), title: title, content: content}
    })
}