import FCM from 'fcm-node';
import Notification from '../models/notifications.js';
let fcm = new FCM('AAAAykA17hA:APA91bHxddISCVoKsEYoorYZc1JZ5BF_rOSBJrnfcJ9bzrsj7mnX7swnh3MyWZY7gYqtxfp65eMKiq-eSMqeudSdeJU9W_uf4tluYdOj2G7u_oCOnWdcQ04itBF1plH3NxyfCY8b7aHV');
// let fcm = new FCM('AAAAa5rjMPU:APA91bExwXjFfywuTOVavSISXNBhuTYjKAYhubJLrso0WWpRRr2eZ42QBLwsb5E00gG2VK2N1ZQgeYmdZkyriUVgkpFl6d-Zd8CnPVvuKQcMHEND0NGBGcwwKE8qCo4Mp0bGqHNpH0Vw');

const sendNotification = (userToken, title, body, data,userid,image=null) =>{
    // console.log(userToken);
    Notification.create({
        title:title,
        body:body,
        userId:userid,
        image:image,
        data:data
    }).then(result => {
        let message = {
            to: userToken, 
            collapse_key: 'xxxxxx-xxxxxx-xxxxxx',
    
            notification: {
                title: title, 
                body: body,
            },
            data: { ...data, notificationid:result._id}
        };
        fcm.send(message, function(err, response){
            if (err) {
                console.log(err,"Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
        console.log("notification inserted")
    }).catch(error => console.log(error))
}

const sendNotificationMultiple = (userToken, title, body, data=null,userids,image) =>{
    let message = {
        registration_ids: userToken, 
        collapse_key: 'xxxxxx-xxxxxx-xxxxxx',
        notification: {
            title: title, 
            body: body,
        },
        data: data
    };
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
            console.log(`${process.env.DOMAIN}${image}`);
        }
    });
    userids.map(id => {
        Notification.create({
            title:title,
            body:body,
            userid:id,
            image:image,
            payload:data
        }).then(result => console.log(result))
        .catch(error => console.log(error))
    })
}

export default{
    sendNotification,
    sendNotificationMultiple
}