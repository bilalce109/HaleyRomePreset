import jwt from 'jsonwebtoken';
import rp from 'request-promise';
import nodemailer from 'nodemailer';
import User from '../models/users.js';

function sendResetPasswordEmail(num, email, name, callback) {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    var mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "Code for reset password",
        html: " Hi <strong>" + `${name}` + "</strong> <br /><br /> Your verification code is <strong>" + `${num}` + "</strong>. <br /> Enter this code in our app to reset your password.",
    };
    return transporter.sendMail(mailOptions, callback)
}

function validateUsername(username) {
    /* 
      Usernames can only have: 
      - Lowercase Letters (a-z) 
      - Numbers (0-9)
      - Dots (.)
      - Underscores (_)
    */
    const res = /^[a-z0-9_\.]+$/.exec(username);
    const valid = !!res;
    return valid;
}

function validateEmail(email) {
    let pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(email);
}

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ");
        req.token = bearerToken[1];
        next();
    } else {
        res.status(401).json({ message: "please Insert Jwt" });
    }
}



function regexSearch(query) {
    let search = '.*' + query + '.*';
    let value = new RegExp(["^", search, "$"].join(""), "i");
    return value;
}

function distance(lat1, lon1, lat2, lon2, unit) {

    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

function filterCoordinates(poslat, poslng, range_in_meter, data) {
    var cord = [];
    for (var i = 0; i < data.length; i++) {
        if (distance(poslat, poslng, data[i].location.lat, data[i].location.lng, "K") <= range_in_meter) {
            cord.push(data[i]._id);
        }
    }
    return cord;
}

function generateZoomJWT(APIKEY, APISECRET) {
    const payload = {
        iss: APIKEY,
        exp: ((new Date()).getTime() + 5000)
    };
    return jwt.sign(payload, APISECRET);
}

async function verifyAuthToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== "undefined") {
        req.token = bearerHeader.split(" ")[1];

        // Validating Token
        let invalidToken = false;
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                invalidToken = true;
                return res.status(401).json({ status: "error", message: "Malformed sign-in token! Please use a valid sign-in token to continue.", data: null });
            }
        });
        if (invalidToken) return;

        // Checking and Adding user to req object.
        req.user = await User.findOne({ verificationToken: req.token }).lean();
        if (!req.user) return res.status(404).json({
            status: "error",
            message: "Invalid sign-in token! Please log-in again to continue.",
            data: null
        });
        // req.user.preferences = await preferredTags(req.user._id);
        // req.user.followedChannels = await followedChannels(req.user._id);
        next();
    } else {
        return res.status(401).json({ status: "error", message: "Please use a sign-in token to access this request.", data: null });
    }
}
/**
 * 
 * @param {string} email pass the developer account's email address
 * @param {string} token pass the jwt token, You can generate token APIKey and API Secret.
 * @param {string} topic pass the topic/agenda of meeting 
 * @returns 
 */
function createZoomMeeting(email, token, topic) {
    var options = {
        method: "POST",
        uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
        body: {
            topic,
            type: 1,
            settings: {
                host_video: "true",
                participant_video: "true",
                private_meeting: "true",
                waiting_room: "true",
                show_share_button: "true"
            }
        },
        auth: {
            bearer: token
        },
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json"
        },
        json: true
    };

    return rp(options);
}

export default {
    sendResetPasswordEmail,
    validateUsername,
    validateEmail,
    verifyToken,
    regexSearch,
    filterCoordinates,
    generateZoomJWT,
    createZoomMeeting,
    verifyAuthToken
}