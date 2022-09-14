import helper from '../utils/helpers.js'; 
import NotificationHandler from '../utils/NotificationHandler.js';
import express from 'express';
import post from '../controllers/post.js';

const router = express.Router();

router.post('/', post.createFeed);
router.post('/viewFeed' , post.viewFeed);
router.post('/viewFeedByUser' , helper.verifyAuthToken ,  post.viewFeedById);
router.post('/favFeed/:id' , post.favFeed);

export default router;