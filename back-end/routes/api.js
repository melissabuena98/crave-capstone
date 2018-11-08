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
                res.status(200).send(registeredUser);
                // res.status(200).send("HELLO");
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
                    // res.json("RESULT",result);
                    res.status(200).json(result)
                })
            });
        });
    }
});

router.post('/add-favorite', (req,res) => {
    let favorite = req.body;
    console.log("FAVORITE: ", favorite);
    User.findOne({_id: favorite.userID}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                user.saved_restaurants.push(favorite);
                user.save((error, updatedUser) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log("FAVORITE SAVED TO DB!!!")
                        res.status(200).send(updatedUser);
                    }
                });
            }
        }
    });
});

router.post('/get-favorites', (req, res) => {
    let user = req.body;
    console.log("USER:", user);
    User.findOne({_id: user.id}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                var favorites = user.saved_restaurants;
                res.status(200).send(favorites);
            }
        }
    });
});

router.post('/remove-favorite', (req, res) => {
    let fave = req.body;
    User.findOne({_id: fave.userID}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                user.saved_restaurants.splice(fave.index, 1);
                user.save((error, updatedUser) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log("FAVORITE REMOVED FROM DB!!!")
                        res.status(200).send(updatedUser);
                    }
                });
            }
        }
    });
});

router.post('/update-profile', (req, res) => {
    let profile = req.body;
    User.findOne({_id: profile.id}, (error, user) => {
        if(error){console.error(error)}
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                user.bio = profile.bio;
                user.location = profile.location
                user.save((error, updatedUser) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log("UPDATED USER'S PROFILE!")
                        res.status(200).send(updatedUser);
                    }
                });
            }
        }
    });
});



module.exports = router;