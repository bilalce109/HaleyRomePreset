import mongoose from 'mongoose';

const ordersSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    totalAmount: {
        type: Number
    },
    OrderItem: [
        {
            filterId: String,
            price: Number
        }
    ]

}, { timestamps: true });

export default mongoose.model('orders',ordersSchema);