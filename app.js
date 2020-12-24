const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

const feedRoutes = require("./routes/feed");

app.use(bodyParser.json());
app.use("/images",express.static(path.join(__dirname,'images')));

app.use((req, res, next) =>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
})

app.use("/feed",feedRoutes);
app.use((error, req, res,next) =>{
    const status = error.statusCode || 500;
    const msg = error.message;
    res.status(status).json({message: msg});
})

mongoose.connect("mongodb+srv://Rahul:MmNsbpFPH89MY0yy@cluster0.b5obq.mongodb.net/messages?retryWrites=true&w=majority")
.then(result =>{
    app.listen(8080);
})
.catch(err => console.log(err));
