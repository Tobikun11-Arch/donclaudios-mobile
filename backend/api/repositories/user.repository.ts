import {UserDocument, UserModel} from '../models/User.model';

export const userRepository = {
  findByEmail: (email: string) =>
    UserModel.findOne({email: email.toLowerCase()}).exec(),

  /** Matches a customer by email or by phone number. */
  findByIdentifier: (identifier: string) =>
    UserModel.findOne({
      $or: [{email: identifier.toLowerCase()}, {phoneNumber: identifier}]
    }).exec(),

  findById: (id: string) => UserModel.findById(id).exec(),

  listAll: () => UserModel.find({}).exec(),

  create: (data: Partial<UserDocument>) => UserModel.create(data),

  updateProfile: (
    userId: string,
    data: Partial<
      Pick<
        UserDocument,
        'firstName' | 'lastName' | 'username' | 'email'
      >
    >
  ) => UserModel.updateOne({_id: userId}, data).exec(),

  updatePassword: (userId: string, passwordHash: string) =>
    UserModel.updateOne({_id: userId}, {passwordHash}).exec(),

  setVerificationCode: (userId: string, code: string, expiry: Date) =>
    UserModel.updateOne(
      {_id: userId},
      {verificationCode: code, verificationExpiry: expiry}
    ).exec(),

  clearVerificationCode: (email: string) =>
    UserModel.updateOne(
      {email: email.toLowerCase()},
      {verificationCode: null, verificationExpiry: null}
    ).exec(),

  setResetCode: (userId: string, code: string, expiry: Date) =>
    UserModel.updateOne(
      {_id: userId},
      {resetCode: code, resetExpiry: expiry}
    ).exec(),

  clearResetCode: (userId: string) =>
    UserModel.updateOne(
      {_id: userId},
      {resetCode: null, resetExpiry: null}
    ).exec(),

  markVerified: (userId: string) =>
    UserModel.updateOne(
      {_id: userId},
      {isVerified: true, verificationCode: null, verificationExpiry: null}
    ).exec()
};