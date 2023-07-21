const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({ 
    title: String,
    image0: String,
    image1: String,
    image2: String,
    price: Number,
    salePrice: Number,
    likes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
const ProductModel = mongoose.model('Product', ProductSchema);
module.exports = ProductModel