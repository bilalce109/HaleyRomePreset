import helper from '../utils/helpers.js'; 
import express from 'express';
import gallery from '../controllers/gallery.js';

const router = express.Router();

router.post('/createGallery', gallery.createGallery);
router.post('/getbeforeimage/:id/image/:imgId' , gallery.getbeforeimage);
router.put('/getbeforeimage/:id/updateImage' , gallery.saveUpdatedImage);
router.put('/saveandpost/:id' , gallery.saveAndPost);

export default router;