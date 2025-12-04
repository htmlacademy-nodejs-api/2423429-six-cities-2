import { Schema, Document, model } from 'mongoose';
import { User, UserType } from '../../types/index.js';

export interface UserDocument extends User, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [1, 'Min length for name is 1 character'],
    maxlength: [15, 'Max length for name is 15 characters']
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is incorrect']
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Min length for password is 6 characters'],
    maxlength: [12, 'Max length for password is 12 characters']
  },
  type: {
    type: String,
    enum: Object.values(UserType),
    required: true,
    default: UserType.Regular
  }
}, {
  timestamps: true,
  collection: 'users'
});

export const UserModel = model<UserDocument>('User', userSchema);
