const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    fullname: String,
    username: String,
    email: String,
    password: String,
    zipcode: Number,
    saved_restaurants: Array,
    bio: String,
    location: String,
    posts: [
        {
            post_id: Number,
            user: String,
            date: Date,
            img: { data: Buffer, contentType: String },
            location: String,
            price: String,
            rating: Number,
            likes: Number
        }
    ]
})

module.exports = mongoose.model('user', userSchema, 'users');