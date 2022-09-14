import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';
import order from '../models/orders.js';
import payment from '../models/payment.js';
import mongoose from 'mongoose';
import filters from '../models/filters.js';
import NotificationHandler from '../utils/NotificationHandler.js';



const createOrder = async (req, res) => {
    
    try {
        let orderId = '';
        let result = await order.create(req.body);
        let filterId = result.OrderItem.map((element) =>{
            return element.filterId;
        });
        if(result)
        {
            orderId = result._id;
            let Payment = await payment.create({...req.body, orderId});
                let data = {
                    userId: Payment.userId,
                    paymentStatus: Payment.paymentStatus
                }
                let updateFilter = await filters.findByIdAndUpdate({_id: filterId},{$push: {payment: data}},{new: true});
                    return res.status(200).json({
                        status: "success",
                        message: "Order Generated",
                        data: result
                    });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request here.",
            data: null,
            trace: error.message
        });
    }
}

const updateOrder = async (req, res) => {
    
    try {
        let orderId =  req.params.id;
        let data = {
            filterId : req.body.filterId,
            price : req.body.price
        }
        let updatedPrice = req.body.price;
        let checkexist = await order.exists({OrderItem:{$elemMatch:{filterId: mongoose.Types.ObjectId(data.filterId)}}});
        
        
        
        if(!checkexist){
            let result = await order.findByIdAndUpdate(orderId , {$push:{OrderItem: data},$inc:{totalAmount: +updatedPrice}});
                await payment.create(req.body);
            return res.status(200).json({
            status: "success",
            message: "Order updated",
            data: result
            });
        }else{
            return res.status(409).json({
                status: "success",
                message: "Filter Already Purchased",
                data: checkexist
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        });
    }
}

export default{
    createOrder,
    updateOrder
};