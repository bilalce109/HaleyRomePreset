import Notifications from "../models/notifications.js";
import User from "../models/users.js";

const updateUserFcmToken = async (req, res) => {
    User.updateOne({ _id: req.body.id }, { $set: { fcm: req.body.fcm } }, (error, response) => {
        if (error) {
            return res.json({
                status: 500,
                error: error.message
            });
        }
        return res.json({
            status: 200,
            message: "Successfully updated"
        });
    });
}

const getUserNotifications = async (req, res) => {
    try {
        let notification = await Notifications.find({ userId: req.user._id.toString() }).sort({ date: -1 }).lean();
        notification = await Promise.all(notification.map(async (notify) => {
            notify.data = await Promise.all(notify.data.map(async (data) => {
                data.senderId = await User.findById(data.senderId).select("name username profile_picture status").exec();
                return data.senderId;
            }));
            return notify;
        }));
        return res.json({
            status: 200,
            message: notification
        });
    } catch (error) {
        return res.json({
            status: 500,
            error: error.message
        });
    }
}

const updateNotificationReadStatus = (req, res) => {
    if (req.params.notificationId == undefined) {
        return res.json({
            status: 400,
            error: error.message
        });
    }
    Notifications.updateOne(
        { _id: req.params.notificationId },
        { $set: { readStatus: 1 } },
        (error, response) => {
            if (error) {
                return res.json({
                    status: 500,
                    error: error.message
                });
            }  
        }
    );
    return res.json({
        status: 200,
        message: 'Successfully updated'
    });
}

export default {
    updateUserFcmToken,
    getUserNotifications,
    updateNotificationReadStatus
}
