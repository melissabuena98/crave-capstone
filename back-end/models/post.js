const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    date: Date,
    location: String,
    // rating: Number,
    caption: String,
    likes: Array,
    image: String,
    username: String,
    userImage: String,
    title: String,
})

// module.exports = mongoose.model('user', userSchema, 'users');
module.exports = Post = mongoose.model('post', postSchema);
// module.exports = mongoose.model('user', userSchema, 'users');