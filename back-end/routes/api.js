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

router.post('/check-username', (req,res) => {
    let uname = req.body.username;
    console.log("IN CHECK USERNAME", uname)
    User.findOne({username: uname}, (error, user) => {
        if(error){
            console.error("ERROR", error);
        }
        else{
            if(!user){
                res.status(200).send(true);
            }
            else{
                res.status(200).send(false);
            }
        }
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
                // res.status(401).send("Invalid username");
                res.status(200).send("invalid username");
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
                        // res.status(401).send("Invalid Password");
                        res.status(200).send("invalid password");
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
                    user: req.body.userID,
                    username: req.body.username,
                    userImage: req.body.userImage,
                    caption: req.body.caption,
                    location: req.body.location,
                    title: req.body.title,
                    image: filename,
                });
                post.save(function (err, result){
                    if(err){}
                    // res.status(200).json(result)
                    //PUT USER POST COUNT FIND HERE
                    User.findOne({_id: req.body.userID}, (error, user) => {
                        if(error){
                            console.error(error);
                        }
                        else{
                            if(!user){
                                res.status(401).send("Invalid user token");
                            }
                            else{
                                user.post_count += 1;
                                user.save((error, updatedUser) => {
                                    if(error){
                                        console.log(error);
                                    }
                                    else{
                                        console.log("POST COUNT UPDATED!!!")
                                        res.status(200).send(updatedUser);
                                        // res.status(200).json(result)
                                    }
                                });
                            }
                        }
                    });
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

router.post('/check-favorite', (req, res) => {
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
                var isFavorited = false;
               for(i=0; i<user.saved_restaurants.length; i++){
                   if(user.saved_restaurants[i].id == favorite.id){
                       isFavorited=true;
                       break;
                   }
               }
               res.status(200).send(isFavorited);
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


router.post('/update-profile-pic', upload.any(), (req, res) => {
    console.log("IN POST UPDATE PIC");
    if(req.files){
        req.files.forEach(function (file){
            console.log(file)

            var filename = (new Date).valueOf()+"-"+file.originalname;
            fs.rename(file.path, 'public/images/' + filename, function(err) {
                if(err) throw err;
                
                User.findOne({_id: req.body.id}, (error, user) => {
                    if(error){console.error(error)}
                    else{
                        if(!user){
                            res.status(401).send("Invalid user token");
                        }
                        else{
                            user.profile_pic = filename;
                            user.save((error, updatedUser) => {
                                if(error){
                                    console.log(error);
                                }
                                else{
                                    console.log("UPDATED USER'S PICTURE!")
                                    res.status(200).send(updatedUser);
                                }
                            });
                        }
                    }
                });
            });
        });
    }
});

router.post('/get-user-posts', (req, res) => {
    let user = req.body;
    console.log("USER:", user);
    Post.find({user: user.id}, (error, posts) => {
        console.log("POSTS", posts);
        if(error){
            console.error(error);
        }
        else{
            if(!posts){
                res.status(401).send("No posts");
            }
            else{
                res.status(200).send(posts);
            }
        }
    });
});

router.post('/get-all-posts', (req, res) => {
    Post.find({}, (error, posts) => {
        console.log("POSTS", posts);
        if(error){
            console.error(error);
        }
        else{
            if(!posts){
                res.status(401).send("No posts");
            }
            else{
                res.status(200).send(posts);
            }
        }
    });
});

router.post('/get-my-posts', (req, res) => {
    let user = req.body;
    let followArray;
    User.findOne({_id: user.id}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                followArray = user.following;
                console.log("FOLLOWING: ", followArray);
                Post.find({'user': {$in: followArray}}, (error, posts) => {
                    console.log("POSTS", posts);
                    if(error){
                        console.error(error);
                    }
                    else{
                        if(!posts){
                            res.status(401).send("No posts");
                        }
                        else{
                            res.status(200).send(posts);
                        }
                    }
                });
            }
        }
    });
});

router.post('/get-all-users', (req, res) => {
    User.find({}, (error, users) => {
        // console.log("USERS", users);
        if(error){
            console.error(error);
        }
        else{
            if(!users){
                res.status(401).send("No users");
            }
            else{
                res.status(200).send(users);
            }
        }
    });
});

router.post('/delete-post', (req, res) => {
    let postObj = req.body;
    console.log("POST:", postObj);
    Post.findOneAndDelete({_id: postObj.postID}, function (err, post) {
        if (err) return console.error("ERROR", err);
        else{
            console.log("IN ELSE 1")
            User.findOne({_id: postObj.userID}, (error, user) => {
                console.log("IN ELSE 2");
                if(error){
                    console.log("IN ELSE 3");
                    console.error(error);
                }
                else{
                    console.log("IN ELSE 4");
                    if(!user){
                    console.log("IN ELSE 5");
                        res.status(200).send("CANT FIND USER");
                    }
                    else{
                        console.log("IN ELSE 6");
                        user.post_count -= 1;
                        user.save((error, updatedUser) => {
                            if(error){
                                console.log(error);
                            }
                            else{
                                console.log("POST DELETED, USER UPDATED")
                                res.status(200).send(updatedUser);
                            }
                        });                        
                    }
                }
            });
        }
        
    });
});

router.post('/like-post', (req, res) => {
    let postData = req.body;
    Post.findOne({_id: postData.postID}, (error, post) => {
        if(error){
            console.error(error);
        }
        else{
            if(!post){
                res.status(401).send("Post does not exist");
            }
            else{
                User.findOne({_id: postData.userID}, (error, user) => {
                    if(error){
                        console.error(error);
                    }
                    else{
                        if(!user){
                            res.status(200).send("Invalid user token");
                        }
                        else{
                            if(!post.likes.includes(postData.userID)){
                                post.likes.push(postData.userID);
                                post.notifications.push(postData.username);
                                user.liked_posts.push(postData.postID);
                                user.save();
                            }
                            else{
                                var index = post.likes.indexOf(postData.userID);
                                post.likes.splice(index, 1);
                                post.notifications.splice(index, 1);
                                var postIndex = user.liked_posts.indexOf(postData.postID);
                                user.liked_posts.splice(postIndex, 1);
                                user.save();
                            }
                            post.save((error, updatedPost) => {
                                if(error){
                                    console.log(error);
                                }
                                else{
                                    console.log("POST LIKE UPDATED")
                                    res.status(200).send(updatedPost)
                                }
                            });
                        }
                    }
                });
               //
            }
        }
    });
});

router.post('/get-profile', (req, res) => {
    let profile = req.body;
    console.log("PROFILE!!", profile);
    User.findOne({_id: profile.id}, (error, user) => {
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

router.post('/follow-user', (req, res) => {
    let userObject = req.body;
    User.findOne({_id: userObject.userID}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                //FOLLOW
                if(!user.following.includes(userObject.followID)){
                    user.following.push(userObject.followID);
                    User.findOne({_id: userObject.followID}, (error, user) => {
                        if(error){
                            console.error(error);
                        }
                        else{
                            if(!user){
                                res.status(401).send("Invalid user token");
                            }
                            else{
                                user.follower_count += 1;
                                user.save((error, updatedUser) => {
                                    if(error){
                                        console.log(error);
                                    }
                                    else{
                                        res.status(200).send(updatedUser);
                                    }
                                });                          
                            }
                        }
                    });
                }
                else{
                    //UNFOLLOW
                    var index = user.following.indexOf(userObject.followID);
                    user.following.splice(index, 1);
                    User.findOne({_id: userObject.followID}, (error, user) => {
                        if(error){
                            console.error(error);
                        }
                        else{
                            if(!user){
                                res.status(401).send("Invalid user token");
                            }
                            else{
                                user.follower_count -= 1;
                                user.save((error, updatedUser) => {
                                    if(error){
                                        console.log(error);
                                    }
                                    else{
                                        res.status(200).send(updatedUser);
                                    }
                                });                          
                            }
                        }
                    });
                }
            }
            user.save();
        }
    });
});

router.post('/get-liked-posts', (req, res) => {
    let user = req.body;
    let postsArray;
    User.findOne({_id: user.id}, (error, user) => {
        if(error){
            console.error(error);
        }
        else{
            if(!user){
                res.status(401).send("Invalid user token");
            }
            else{
                postsArray = user.liked_posts;
                Post.find({'_id': {$in: postsArray}}, (error, posts) => {
                    console.log("LIKES", posts);
                    if(error){
                        console.error(error);
                    }
                    else{
                        if(!posts){
                            res.status(401).send("No posts");
                        }
                        else{
                            res.status(200).send(posts);
                        }
                    }
                });
            }
        }
    });
});

module.exports = router;