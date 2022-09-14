import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import Gallery from '../models/gallery.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';
import fs from 'fs';
import axios from 'axios';






const createGallery = async (req, res) => {
    try {
        req.body.beforePath = [];
        let file = req.files.beforePath;
        for (let i = 0; i < file.length; i++) {
            let fileName = `public/uploads/beforePath/${Date.now()}-${file[i].name.replace(/ /g, '-').toLowerCase()}`;
            file[i].mv(fileName, async (err) => {
                if (err) return res.status(400).json({ message: err.message });
            });
            fileName = fileName.replace("public", "");
            req.body.beforePath.push({ 'path': fileName });
        }
        // {// return res.json(req.body);.gallery_image}
        const galleryData = await Gallery.create(req.body);
        // let galleryId = galleryData._id;
        // let userId = req.body.userId;
        // let data = {
        //     galleryID: galleryId
        // }
        // await User.findByIdAndUpdate({_id:userId}, {$push: {'gallery_image' : data}});
        // delete array element from an array
        // await User.updateOne({_id:getID}, {$pull: {'gallery_image' : {"galleryID": "630664f2f430597e19a3a6f5"}}});
        return res.json({ status: 200, data: galleryData, message: "Gallery Added" });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        });
    }
}

let getbeforeimage = async (req,res) =>{
    try {
        let galleryID = req.params.id;
        let imageID = req.params.imgId;
        // let result = await Gallery.findById(galleryID).select('beforePath.path');
        // let beforePath = result.beforePath;
        // let path = [];
        // path = beforePath.map(element => {
        //     return element.path;
        // });
        // let result = await Gallery.find({'_id': { $in: [
        //         mongoose.Types.ObjectId('63068f330ab368be31d09c13'),
        //     ]}})
        
        let result = await Gallery.findById(galleryID,{
            "beforePath": {$elemMatch: {_id: imageID}}
        });
        let path;
        result.beforePath.forEach(element => {
            path = element.path;
        });
        
        
        return res.status(200).json({
            status: "Success",
            message: "Retrieve Image",
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

let saveUpdatedImage = async(req, res) =>{
    try {
        let galleryID = req.params.id;
        let file = req.files.afterPath;
        let fileName = `public/uploads/afterPath/${Date.now()}-${file.name.replace(/ /g, '-').toLowerCase()}`;
        file.mv(fileName, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
        });
        fileName = fileName.replace("public", "");
        let data = {
            path : fileName,
            beforePath: req.body.beforePath,
            filterId: req.body.filterId
        }
        const result = await Gallery.findByIdAndUpdate(galleryID, {$push: {afterPath: data}});
        
        return res.status(200).json({
            status: "Success",
            message: "Retrieve Image",
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

let saveAndPost = async(req, res) =>{
    try {
        let type = req.body.type;
        let galleryID = req.params.id;
        let file = req.files.afterPath;
        let fileName = `public/uploads/afterPath/${Date.now()}-${file.name.replace(/ /g, '-').toLowerCase()}`;
        file.mv(fileName, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
        });
        fileName = fileName.replace("public", "");
        let data = {
            path : fileName,
            beforePath: req.body.beforePath,
            filterId: req.body.filterId
        }
        if(type == "save"){
            const result = await Gallery.findByIdAndUpdate(galleryID, {$push: {afterPath: data}});
            return res.status(200).json({
                status: "Success",
                message: "Save Image",
                data: result
            });
        }else{
            const result = await Gallery.findByIdAndUpdate(galleryID, {$push: {afterPath: data}});
                let postData ={
                    userID: result.userId,
                    imageID: req.params.id,
                    filterID: req.body.filterId,
                    type: req.body.type
                }
                await Post.create(postData);
                return res.status(200).json({
                    status: "Success",
                    message: "Save and Post Image",
                    data: result
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
    createGallery,
    getbeforeimage,
    saveUpdatedImage,
    saveAndPost
};