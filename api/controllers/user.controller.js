import { errorHandler } from '../utils/error.js';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

export const updateUserInfo = async (req, res, next) => {
  if (!req.user.id !== req.params.id) {
    next(errorHandler(401, 'you can only your information'));
  }
  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
    const updateUserInfo = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true },
    );

    const { password, ...results } = updateUserInfo._doc;
    res.status(200).json({ results });
  } catch (e) {
    next(e);
  }
};
