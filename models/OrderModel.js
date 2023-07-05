const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({ 
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    },
    quantity: {
        type: String
    },
    price: {
        type: String
    },
    status: {
        type: String // pending, ready, delivered
    }

}, { timestamps: true });
const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel