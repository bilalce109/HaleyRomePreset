import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    userId: String,
    filterCategory: String,
    beforePath: [{
        path: String,
    }],
    afterPath: [{
        path: String,
        beforePath: String,
        filterId: String,
    }],
    type: {
        type: String, default: 'save'
    },
    addedAt: {
        type: Date,
        default: () => Date.now()
    }
}, { timestamps: true });

export default mongoose.model('gallery',gallerySchema);