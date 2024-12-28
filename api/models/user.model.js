import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        'https://toppng.com/uploads/preview/file-svg-profile-icon-vector-11562942678pprjdh47a8.png',
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);
export default User;
