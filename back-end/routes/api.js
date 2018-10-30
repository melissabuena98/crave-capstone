const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt-nodejs');

const multer = require('multer');
const upload = multer({dest: 'uploads/'})
const fs = require('fs');


const User = require('../models/user');
const Post = require('../models/post');

const mongoose = require('mongoose');
const db = "mongodb://mbuena:cravepw1@ds125293.mlab.com:25293/cravedb";

mongoose.connect(db, { useNewUrlParser: true }, err => {
    if(err){
        console.error('Error: ' + err);
    }
    else{
        console.log('Connected to mongoDB');
    }
})

router.get('/', (req, res) => {
    res.send("From API route");
})

router.post('/register', (req, res) => {
    console.error("IM IN REGISTER POST")
    let userData = req.body;
    let user = new User(userData);
    //bcrypt 
    bcrypt.hash(user.password, null, null, function(err, hash){
        user.password = hash;
        user.save((error, registeredUser) => {
            if(error){
                console.log(error);
            }
            else{
                // res.status(200).send(registeredUser);
                res.status(200).send("HELLO");
            }
        })
    });

})

router.post('/login', (req, res) => {
    let userData = req.body;

    User.findOne({username: userData.username}, (error, user) => {
        if(error){
            console.log(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid username");
            }
            else{
                //unhash
                bcrypt.compare(userData.password, user.password, function(err, check){
                    if(check){
                        let payload = {subject: user._id}
                        let token = jwt.sign(payload, 'craveSecretKey')
                        console.log("LOGIN TOK", token);
                        res.status(200).send({token});
                    }
                    else{
                        res.status(401).send("Invalid Password");
                    }
                });
            }
        }
    })
});

router.post('/getUser', (req, res) => {
    console.log("GETTING USER");
    let userToken = req.body;
    var decoded = jwt.verify(userToken.token, 'craveSecretKey');
    User.findOne({_id: decoded.subject}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                res.status(200).send(user);
            }
        }
    });
});

router.post('/upload', upload.any(),(req,res) => {
    if(req.files){
        req.files.forEach(function (file){
            console.log(file)

            var filename = (new Date).valueOf()+"-"+file.originalname;
            fs.rename(file.path, 'public/images/' + filename, function(err) {
                if(err) throw err;
                
                var post = new Post({
                    caption: req.body.caption,
                    location: req.body.location,
                    image: filename,
                });
                post.save(function (err, result){
                    if(err){}
                    res.json("RESULT",result);
                })
            });
        });
    }

});




module.exports = router;