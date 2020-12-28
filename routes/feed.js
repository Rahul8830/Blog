const express = require("express");
const { body } = require("express-validator")

const router = express.Router();

const feedController = require("../controller/feed");
const isAuth = require("../middleware/is-auth");

router.get("/posts", isAuth, feedController.getPosts);

router.get("/status", isAuth, feedController.getStatus);

router.get("/post/:postId", isAuth, feedController.getPost);

router.post("/posts", [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.createPost);


router.put("/updatePost/:postId", [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.updatePost);

router.put("/updateStatus", [
    body('statusData').trim()
], isAuth, feedController.updateStatus);

router.delete("/deletePost/:postId", isAuth, feedController.deletePost);

module.exports = router;