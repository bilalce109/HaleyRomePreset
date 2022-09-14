import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';
import payment from '../models/payment.js';



const createPayment = async (req, res) => {
    try {
        let result = await payment.create(req.body);
        return res.status(200).json({
            status: "success",
            message: "Payment Done",
            data: result
        });
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
    createPayment
};