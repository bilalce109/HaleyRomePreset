import helper from '../utils/helpers.js'; 
import express from 'express';
import filters from '../controllers/filters.js';
import filtersCategory from '../controllers/filtersCategory.js';

const router = express.Router();

router.post('/', filters.addFilters);
router.post('/:id', filters.viewFilter);

export default router;