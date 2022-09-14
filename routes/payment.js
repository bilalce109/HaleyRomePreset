import helper from '../utils/helpers.js'; 
import express from 'express';
import payment from '../controllers/payment.js';
import orders from '../controllers/orders.js';

const router = express.Router();

router.put('/addOrders' , orders.createOrder);
router.put('/updateOrders/:id' , orders.updateOrder);
router.post('/addPayment', payment.createPayment);

export default router;