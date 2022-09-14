import express from "express";
import helper from '../utils/helpers.js'; 
import notifications from "../controllers/notifications.js";
const router = express.Router();

router.put('/updateUserFcmToken', notifications.updateUserFcmToken);
router.get('/getUserNotifications', helper.verifyAuthToken, notifications.getUserNotifications);
router.put('/updateNotificationReadStatus/:notificationId', notifications.updateNotificationReadStatus);
export default router;