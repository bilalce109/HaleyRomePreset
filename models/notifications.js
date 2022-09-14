import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    data: {
        type: Array,
    },
    date: {
        type: Date,
        default: Date.now,
        expires: 14 * 24 * 60 * 60
    },
    readStatus: {
        type: Number,
        default: 0
        //0 = unread, 1 = read
    }
});
export default mongoose.model("notifications", notificationSchema)
