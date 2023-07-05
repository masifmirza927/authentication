const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({ 
    name: {
        type: String,
        required: [true, "Please provide valid name"]
    },
    email: {
        type: String,
        required: [true, "Please provide valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide valid password"]
    },
    image: {
        type: String
    },
    role: {
        type: String,
        default: "user"
    }

}, { timestamps: true });
const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel