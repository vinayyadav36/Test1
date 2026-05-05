import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'staff' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    role: { type: String, enum: ['owner', 'staff', 'admin'], default: 'staff' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
