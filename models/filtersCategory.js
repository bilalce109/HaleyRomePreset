import mongoose from 'mongoose';

const filtersCatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false, 
    }
}, { timestamps: true });

export default mongoose.model('filtersCategory',filtersCatSchema);