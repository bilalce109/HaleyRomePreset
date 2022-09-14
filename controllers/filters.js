import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';
import filters from '../models/filters.js'



const addFilters = async (req, res) => {
    try {
        let result = filters.create(req.body);
        return res.status(200).json({
            status: "success",
                message: "Filter Added Successfully",
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

// const unlockFilter = async (req, res) => {
//     try {
//         let filterId = req.params.id;
//         let result = await filters.findById(filterId);
//         if(result.status == "free"){
//             let newResult = await filters.findByIdAndUpdate(filterId,{paymentID: null});
//         }else if(result.status == "pending"){
//             let newResult = await filters.findByIdAndUpdate(filterId,{$set:{paymentID: req.body.paymentID,status:req.body.status}});
//         }else{}
//         return res.status(200).json({
//             status: "success",
//                 message: "Filter find",
//                 data: result
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: "An unexpected error occurred while proceeding your request.",
//             data: null,
//             trace: error.message
//         });
//     }
// }

const viewFilter = async (req, res) =>{
    let userId = req.params.id;
    let result = await filters.find({
        payment: {$elemMatch: { userId: userId }}
    })

    res.send({
        status: 200,
        data: result
    })
}

export default{
    addFilters,
    viewFilter
    
};