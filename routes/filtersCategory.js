import helper from '../utils/helpers.js'; 
import express from 'express';
import filtersCategory from '../controllers/filtersCategory.js';

const router = express.Router();

router.post('/' , filtersCategory.addFiltersCategory);
router.post('/:id' , helper.verifyAuthToken , filtersCategory.viewFiltersCategory);

export default router;