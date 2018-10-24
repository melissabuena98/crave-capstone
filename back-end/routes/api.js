const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt-nodejs');

const User = require('../models/user');

const mongoose = require('mongoose');
const db = "mongodb://mbuena:cravepw1@ds125293.mlab.com:25293/cravedb";

mongoose.connect(db, err => {
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




module.exports = router;