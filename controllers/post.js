import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import NotificationHandler from '../utils/NotificationHandler.js';
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';
import filters from '../models/filters.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';



const createFeed = async (req, res) => {
    try {
            let result = await Post.create(req.body);
            return res.status(200).json({
                status: "success",
                message: "Feed Added",
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

const viewFeed = async (req,res) => {
    try {
        let result = await Post.aggregate([
        { 
            $lookup: { 
                from: 'galleries', 
                localField: 'imageID', 
                foreignField: '_id', 
                as: 'Image' 
            }},{
            $lookup: { 
                from: 'users', 
                localField: 'userID', 
                foreignField: '_id', 
                as: 'Users' 
            }},{
            $lookup: { 
                from: 'filters', 
                localField: 'filterID', 
                foreignField: '_id', 
                as: 'Filter_Used' 
            }
        }]);
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

const viewFeedById = async (req,res) => {
    try {
        let userID = req.user._id;
        let result = await Post.aggregate([{ $match: { "userID": mongoose.Types.ObjectId(userID) } },
        { 
            $lookup: { 
                from: 'galleries', 
                localField: 'userID', 
                foreignField: 'userId', 
                as: 'Image' 
            } 
        }]);
        return res.status(200).json({
            status: "success",
            message: "Feed By User ID",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
            data: null
        });
    }
}

const favFeed = async (req, res) => {
    let postId = req.params.id;
    let result = await Post.findById(postId);
    let findUserLike = result.fav_post.findIndex(index => index.user_id == req.body.user_id);
    if (findUserLike == -1) {
        result.fav_post.push(req.body)
    }else{
        result.fav_post.splice(findUserLike,1);
    }
    await result.save();
    // console.log(findUserLike);
    // let postData = await Post.findOne({_id: postId});
    // jis ki post ko like kia

    // let ownerId = postData.userID;
    // let ownerData = await User.find(ownerId);
    // let subscriberId = req.body.user_id;
    // let subscriberData = await User.find(subscriberId);
    
    let user = await User.findById({_id : req.body.user_id});
    
    NotificationHandler.sendNotification('e8Fa_u2ESDSANO3Q8eMUw1:APA91bFcGXz7LTM5vUBII-RewqQKxaggjc8Fo8OCqvEPSd3NW4NF0PeOcc7UojH3FLx_F5L865_MY4hx3eoF7Yw9dacqmqww3O6yJmVf9N3btENFtPWc4CyVBgsH5tLs7QdbBqdEGMaa', 'added notification', 'Check Profile', {screen: "notification_screen"}, user._id);
    res.send({
        status: 200,
        message: result
    })
}

const saveFeed = async (req, res) => {
    let postId = req.params.id;
    let result = await Post.findById(postId);
    let findUserLike = result.like_post.findIndex(index => index.user_id == req.body.user_id);
    if (findUserLike == -1) {
        result.like_post.push(req.body)
    }else{
        result.like_post.splice(findUserLike,1);
    }
    await result.save();
    res.send({
        status: 200,
        message: result
    })
}

export default{
    createFeed,
    viewFeed,
    viewFeedById,
    favFeed,
    saveFeed
};