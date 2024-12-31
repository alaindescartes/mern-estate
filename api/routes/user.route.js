import express from 'express';
import { deleteUserInfo, updateUserInfo } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id', verifyToken, updateUserInfo);
router.delete('/delete/:id', verifyToken, deleteUserInfo);

export default router;
