import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId
    },
    tranctionId: {
        type: mongoose.Schema.Types.ObjectId
    },
    totalAmount: {
        type: Number
    },
    paymentStatus: {
        type: String
    },
    invoiceUrl:{
        type: String
    },
    filterId:{
        type: String
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

export default mongoose.model('payment',paymentSchema);