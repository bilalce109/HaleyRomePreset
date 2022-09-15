import express from "express";
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';

import usersRoutes from "./routes/users.js";
import filtersRoutes from './routes/filters.js';
import filtersCatRoutes from './routes/filtersCategory.js';
import galleryRoutes from './routes/gallery.js';
import postRoutes from './routes/post.js';
import paymentRoutes from './routes/payment.js';
import notifications from "./routes/notifications.js";

import mongoose from "mongoose";
import helpers from "./utils/helpers.js";
import { MongoUtil } from "./utils/MongoUtils.js";

dotenv.config();
var PORT = process.env.PORT,
    DB_URL = process.env.DB_URL

    mongoose.connect(DB_URL,
        { useNewUrlParser: true, useUnifiedTopology: true },()=>{
            console.log("Db connected");
        });

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

app.use("/api/users", usersRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/filtersCat" , filtersCatRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/post", postRoutes);
app.use("/api/payment" , paymentRoutes);
app.use("/api/notifications", notifications);

app.get("/", (req, res) => res.send("Welcome to the Users API!"));
app.all("*", (req, res) => res.status(404).send("You've tried reaching a route that doesn't exist."));

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
