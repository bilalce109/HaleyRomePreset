import helper from '../utils/helpers.js'; 
import express from 'express';
import userController from '../controllers/users.js';

const router = express.Router();

router.get('/home', userController.home);

router.post('/', userController.register);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/changePassword", userController.changePassword);
router.get('/checkUsername/:username', userController.usernameAvailable);
router.get('/checkProviderId/:provider_id', userController.CheckProviderId);
router.get('/profile/:id', userController.getUserProfile);
router.post('/sociallogin', userController.sociallogin);
router.post('/login', userController.login);
router.post('/profilePicture', helper.verifyAuthToken, userController.profilePicture);
router.delete('/profilePicture', helper.verifyAuthToken, userController.deleteProfilePicture);
router.get('/', helper.verifyAuthToken, userController.getUser);
router.put('/', helper.verifyAuthToken, userController.updateUser);
router.delete('/', helper.verifyAuthToken, userController.deleteUser);
router.get('/profile/:id', userController.getUserProfile);

export default router;