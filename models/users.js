import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"], 
    },
    password: {
        type: String,
        min: [8,"Password must be 8 characters"],
        required: true
    },
    dateofbirth: {
        type: Date,
        required: false,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
    },
    profile_picture:{
        type: String
    },
    verificationToken: {
        type: String,
    },
    // gallery_image:[
    //     {
    //         galleryID : mongoose.Schema.Types.ObjectId,
            
    //     }
    // ],
    status: {
        type: Number,
        default: 0
    },
    otpCode: {
        type: Number
    },
    fcm: {
        type: String
    },
    provider_name: {
        type: String,
        required: false
    },
    provider_id: {
        type: String,
        required: false
    }
});
export default mongoose.model('users',usersSchema);