import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import helper from '../utils/helpers.js'; 
import User from '../models/users.js'; 
import SimpleSchema from 'simpl-schema';

const home = (req, res) => {
    res.send('Hello From Home');
}

const register = async (req, res) => {
    try {
        let body = req.body;
        const userSchema = new SimpleSchema({
            name: String,
            email: String,
            username: String,
            password: String,
            fcm: String,
        }).newContext();

        if (!userSchema.validate(body)) {
            res.status(400).json({
                status: "error",
                message: "Please fill all the fields to proceed further!",
                trace: body
            })
        }

        const userExist = await User.findOne({ $or: [{ email: body.email }, { username: body.username }] });
        if (userExist) {
            return res.status(409).json({
                status: "error",
                message: "A user with this username or email already exists.",
                data: null,
                trace: { username: body.username, email: body.email }
            });
        }

        if (!helper.validateUsername(body.username)) {
            return res.status(400).json({
                status: "error",
                message: "Username can only have lowecase letters, dots, underscores and numbers.",
                data: null,
            });
        }

        if (!helper.validateEmail(body.email)) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid email address.",
                data: null,
                trace: `Email Address: ${body.email} is not valid`
            });
        }

        body.password = await bcrypt.hash(body.password, 10);
        new User(body).save().then(inserted => {
            inserted.verificationToken = jwt.sign({ id: inserted._id, username: inserted.username }, process.env.JWT_SECRET);
            inserted.save();
            return res.json({
                status: "success",
                message: "User Added Successfully",
                data: inserted,
            });
        }).catch(error => {
            return res.status(500).json({
                status: "error",
                message: "An unexpected error occurred while proceeding your request.",
                data: null,
                trace: error.message
            });
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

const updateUser = async (req, res) => {
    try {
        let body = req.body;
        if (body.password !== undefined) body.password = await bcrypt.hash(body.password, 10);
        if (body.verificationToken !== undefined) return res.status(400).json({
            status: "error",
            message: "Sorry! You can't update verification token.",
            data: null,
            trace: body
        });
        if (body.email !== undefined) return res.status(400).json({
            status: "error",
            message: "Sorry! You can't update your email address"
        });

        if (body.username !== undefined) return res.status(400).json({
            status: "error",
            message: "Sorry! You can't update your username.",
            data: null
        });

        const updatedUser = await User.findOneAndUpdate({ _id: req.user._id }, { $set: body }, { new: true }).lean();
        return res.json({
            status: "success",
            message: "Your Profile has been updated!",
            data: updatedUser
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!req.body?.password) return res.status(409).json({
            status: "error",
            message: "Please enter a password to continue."
        });

        const user = await User.findById(req.user._id).lean();
        const isPassword = await bcrypt.compare(req.body?.password, user.password);
        if (!isPassword) return res.status(409).json({
            status: "error",
            message: "Incorrect Password! Please try again with a different password."
        });
        User.findByIdAndDelete(req.user._id, (err, docs) => {
            if (err) res.status(500).json({ status: "error", message: "An unexpected error occured while proceeding your request.", data: null, trace: err });
            res.json({
                status: "success",
                message: "Your account has been removed successfully.",
                data: docs
            });
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        })
    }
};

const getUser = async (req, res) => {
    try {
        delete req.user.password;
        return res.json({
            status: "success",
            message: `Successfully retrieved User: ${req.user.username}.`,
            data: req.user
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        });
    }
}

const login = async (req, res) => {
    try {
        let { username, password, fcm } = req.body;
        const loginSchema = new SimpleSchema({
            username: String,
            password: String
        }).newContext();

        if (!loginSchema.validate({ username, password })) {
            return res.status(400).json({
                status: "error",
                message: "Username or Password is missing.",
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }

        let user = {};
        if (!helper.validateEmail(username)) {
            user = await User.findOne({ username }).lean();
        }
        else {
            user = await User.findOne({ email: username }).lean();
        }

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: `User: ${username} doesn't exists.`,
                data: null,
                trace: `{username: ${username}, password: ${password}}`
            });
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if (isPassword) {
            const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
            delete user.password;
            delete user.verificationToken;
            delete user.fcm;
            user.verificationToken = token;
            user.fcm = fcm;
            User.updateOne({ _id: user._id }, { $set: { verificationToken: token, fcm: fcm } }).then(response => {
                return res.json({
                    status: "success",
                    message: `Login Successful! Logged in as ${username}`,
                    data: user
                })
            }).catch(err => {
                return res.status(500).json({
                    status: "error",
                    message: "An unexpected error occurred while proceeding your request.",
                    data: null,
                    trace: err.message
                })
            });
        }
        else {
            return res.status(400).json({
                status: "error",
                message: "Incorrect Password.",
                data: null,
                trace: `Password: ${password} is incorrect`
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        })
    }
}

const sociallogin = async (req, res) => {
    try {
        let body = req.body;
        const loginSchema = new SimpleSchema({
            name: String,
            email: String,
            username: String,
            fcm: String,
            provider_name: String,
            provider_id: String
        }).newContext();

        if (!loginSchema.validate(body)) {
            return res.status(400).json({
                status: "error",
                message: "Username or provider_id is missing.",
                data: null,
                trace: loginSchema.validationErrors()
            });
        }

        const userExist = await User.findOne({ $or: [{ email: body.email }, { username: body.username }] }).lean();
        if (userExist) {
            // if (userExist.password) return res.json({
            //     status: 'error',
            //     message: `Aleady Exist Username or email`
            // });
            const token = jwt.sign({ id: userExist._id, username: userExist.username }, process.env.JWT_SECRET);
            delete userExist.verificationToken;
            delete userExist.fcm;
            userExist.verificationToken = token;
            userExist.fcm = body.fcm;
            userExist.is_new = true;
            // userExist.payment = await payment.find({ userId: userExist._id });
            User.updateOne({ _id: userExist._id }, { $set: { verificationToken: token, fcm: body.fcm } }).then(response => {
                return res.json({
                    status: "success",
                    message: `Login Successful! Logged in`,
                    data: userExist,
                })
            }).catch(err => {
                return res.status(500).json({
                    status: "error",
                    message: "An unexpected error occurred while proceeding your request.",
                    data: null,
                    trace: err.message
                })
            });
        } else {
            User(body).save().then(inserted => {
                inserted.verificationToken = jwt.sign({ id: inserted._id, username: inserted.username }, process.env.JWT_SECRET);
                inserted.save();
                return res.json({
                    status: "success",
                    message: "User Added Successfully",
                    data: inserted,
                });
            }).catch(error => {
                return res.status(500).json({
                    status: "error",
                    message: "An unexpected error occurred while proceeding your request.",
                    data: null,
                    trace: error.message
                });
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while proceeding your request.",
            data: null,
            trace: error.message
        })
    }
}

const usernameAvailable = async (req, res) => {
    try {
        const username = req.params.username;
        const usernameRegex = /^[a-z0-9_\.]+$/.exec(username);
        if (!(!!usernameRegex)) {
            return res.json({
                status: "error",
                message: "The username can only have lowercase letters, underscores and numbers.",
                data: null,
            });
        }
        const isAvailable = await User.findOne({ username });
        if (isAvailable) {
            return res.json({ status: "error", message: "This username is already taken.", data: null });
        }
        else {
            return res.json({ status: "success", message: "Username is available", data: null });
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null
        });
    }
}

const CheckProviderId = async (req, res) => {
    try {
        const provider_id = req.params.provider_id;
        const isAvailable = await User.findOne({ provider_id });
        if (isAvailable) {
            let email = isAvailable.email;
            return res.status(200).json({ status: "success", message: "This provider_id is already taken.", data: { "email": email } });
        }
        else {
            return res.status(200).json({ status: "success", message: "provider_id is Not Found", data: null });
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null
        });
    }
}

const profilePicture = async (req, res) => {
    try {
        let profilePicture = req.files?.profilePicture;

        if (!profilePicture) return res.status(400).json({
            status: "error",
            message: "Please add profile picture to continue.",
            data: null,
        });

        let fileName = `public/profiles/${Date.now()}-${profilePicture.name.replace(/ /g, '-').toLowerCase()}`;
        await profilePicture.mv(fileName);

        profilePicture = fileName.replace("public", "");
        const userUpdated = await User.findByIdAndUpdate(req.user._id, { $set: { profile_picture: profilePicture } }, { new: true });
        return res.json({
            status: "success",
            message: "Profile Picture Updated!",
            data: userUpdated.profile_picture
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        })
    }
};

const deleteProfilePicture = async (req, res) => {
    try {
        await User.updateOne({ _id: req.user._id }, { $set: { profile_picture: null } });
        return res.json({
            status: "success",
            message: "Profile Picture Removed!"
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id, { password: 0, verificationToken: 0 }).lean();
        if (user) {
            return res.json({
                status: "success",
                message: `Successfully retrieved User: ${user.username} from ID: ${id}`,
                data: user
            });
        }
        else {
            return res.status(404).json({
                status: "error",
                message: `No Users Found! Please try again with a different id.`,
                data: null,
                trace: `ID: ${id}`
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "An unexpected error occured while proceeding your request.",
            data: null,
            trace: err.message
        });
    }
}

const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.json({
                status: 404,
                error: "Invalid email"
            });
        }
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        await helper.sendResetPasswordEmail(randomNumber, user.email, user.username);
        await User.updateOne({ email: email }, { $set: { otpCode: randomNumber } });
        return res.json({
            status: 200,
            message: "Check email for OTP Code."
        })
    } catch (error) {
        return res.json({
            status: 500,
            error: error.message
        });
    }
}

const changePassword = async (req, res) => {
    const { email, password, otpCode } = req.body;
    const user = await User.findOne({ otpCode }).lean();
    if (!user) {
        return res.json({
            status: 400,
            error: "Invalid OTP Code"
        });
    }
    if (user.email !== email) {
        return res.json({
            status: 400,
            error: "Invalid Email"
        });
    }
    if (password == "") {
        return res.json({
            status: 404,
            error: "Password is required"
        });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    try {
        await User.updateOne({ email: email }, { $set: { password: hashpassword, otpCode: '' } });
        return res.json({
            status: 200,
            message: "Your password has been changed successfully",
        });
    } catch (error) {
        return res.json({
            status: 400,
            error: error.message
        });
    }
}

const findUserByEmail = async (req, res) => {
    try {
        let email = req.params.email;
        const userExist = await User.findOne({ email: email });
        if (!userExist) {
            return res.status(404).json({
                status: "error",
                message: "User with this email does not exists",
                data: null,
                trace: { email: email }
            });
        }
        userExist.verificationToken = jwt.sign({ id: userExist._id, username: userExist.username }, process.env.JWT_SECRET);
        userExist.save();
        return res.json({
            status: "success",
            message: "User retrieved Successfully",
            data: userExist
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

const addBeforeGallery = async (req, res) => {
    let getId = req.params.id;
    req.body.gallery_image = [];
    let file = req.files.gallery_image;
    for (let i = 0; i < file.length; i++) {
        let fileName = `public/uploads/beforePath/${Date.now()}-${file[i].name.replace(/ /g, '-').toLowerCase()}`;
        // console.log(fileName);  
        // // return;
        file[i].mv(fileName, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
        });
        fileName = fileName.replace("public", "");
        req.body.gallery_image.push({'beforePath': fileName });
    }
    // return res.json(req.body);
    const userData = await User.findByIdAndUpdate(getId , {$push:{gallery_image: req.body}});
    return res.json({ status: 200, data: userData, message: "Post Updated...." });
}

export default{
    register,
    getUser,
    updateUser,
    deleteUser,
    usernameAvailable,
    CheckProviderId,
    sociallogin,
    login,
    profilePicture,
    deleteProfilePicture,
    getUserProfile,
    forgetPassword,
    changePassword,
    findUserByEmail,
    home,
    addBeforeGallery
};