const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    fullname: String,
    username: String,
    profile_pic:String,
    // email: String,
    password: String,
    zipcode: Number,
    post_count: Number,
    follower_count: Number,
    saved_restaurants: Array,
    bio: String,
    location: String,
    following: Array,
})

// module.exports = mongoose.model('user', userSchema, 'users');
module.exports = User = mongoose.model('user', userSchema);
// module.exports = mongoose.model('user', userSchema, 'users');