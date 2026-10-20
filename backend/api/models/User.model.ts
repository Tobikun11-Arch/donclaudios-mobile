import mongoose from 'mongoose';
import {BaseUserDocument, createBaseUserSchema} from './base/BaseUser.schema';

export interface UserDocument extends BaseUserDocument {
  phoneNumber?: string;
  address?: string;
  profilePhoto?: string;
  points?: number;
}

const UserSchema = createBaseUserSchema<UserDocument>();

// Customers also carry contact/shipping/profile data managed by the web app.
UserSchema.add({
  phoneNumber: {type: String, default: ''},
  address: {type: String, default: ''},
  profilePhoto: {type: String},
  points: {type: Number, default: 0}
});

export const UserModel = mongoose.model<UserDocument>(
  'User',
  UserSchema,
  'customers'
);