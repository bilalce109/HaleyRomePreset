import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    filterID: {
        type: mongoose.Schema.Types.ObjectId
    },
    imageID: {
        type: mongoose.Schema.Types.ObjectId
    },
    collectionCat:{
        type: mongoose.Schema.Types.ObjectId
    },
    fav_post: [{
        user_id : String
    }],
    save_post:[{
        user_id: String
    }]
}, { timestamps: true });

export default mongoose.model('post',postSchema);