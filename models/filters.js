import mongoose from 'mongoose';

const filtersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false, 
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId
    },
    payment: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        paymentStatus: {
            type: String
        }
    }]
}, { timestamps: true });

export default mongoose.model('filters',filtersSchema);