import express from 'express';
import {
  deleteUserInfo,
  getUser,
  getUserListing,
  updateUserInfo,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id', verifyToken, updateUserInfo);
router.delete('/delete/:id', verifyToken, deleteUserInfo);
router.get('/listings/:id', verifyToken, getUserListing);
router.get('/:id', verifyToken, getUser);

export default router;
