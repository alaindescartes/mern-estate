import { errorHandler } from '../utils/error.js';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

export const updateUserInfo = async (req, res, next) => {
  // Authorization check
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only update your own information'));
  }

  try {
    const updates = {};

    if (req.body.username) {
      updates.username = req.body.username;
    }

    if (req.body.password) {
      updates.password = bcrypt.hashSync(req.body.password, 10);
    }

    if (req.body.avatar) {
      updates.avatar = req.body.avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    // Update the user in the database
    const updateUserInfo = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true },
    );

    if (!updateUserInfo) {
      return next(errorHandler(404, 'User not found'));
    }

    const { password, ...results } = updateUserInfo._doc;

    res.status(200).json({ results });
  } catch (error) {
    console.error('Update Error:', error);
    next(error);
  }
};
export const deleteUserInfo = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account'));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User deleted');
  } catch (err) {
    next(err);
  }
};
