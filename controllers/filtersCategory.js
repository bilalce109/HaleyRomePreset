import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';
import filtersCategory from '../models/filtersCategory.js';
import filters from '../models/filters.js';
import mongoose from 'mongoose';



const addFiltersCategory = async (req, res) => {
    try {
        let result = filtersCategory.create(req.body);
        return res.status(200).json({
                status: "success",
                message: "Filters Category Added Successfully",
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

const viewFiltersCategory = async (req, res) => {
    try {
        let catId = req.params.id;
        let userId = req.user._id;
        userId = mongoose.Types.ObjectId(userId);
        let result = await filtersCategory.aggregate([{$match: {_id : mongoose.Types.ObjectId(catId)}},
            {$lookup:{
                from: "filters",
                pipeline: [
                    {
                      $match: { "payment.userId": mongoose.Types.ObjectId(userId) },
                    },
                  ],
                as: "Payment"
            }}

        ]);

        // let filterPayments = await filters.find({categoryID:mongoose.Types.ObjectId('63040c8416a9936681e8bce8') , payment: {$elemMatch:{ userId : mongoose.Types
        //     .ObjectId('630664f2f430597e19a3a6f6') }} });
        // console.log(filterPayments);
        // return;

        return res.status(200).json({
            status: "success",
            message: "Filters by Filter Category",
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
    addFiltersCategory,
    viewFiltersCategory
};