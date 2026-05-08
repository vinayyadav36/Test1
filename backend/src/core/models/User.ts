import { Schema, model } from 'mongoose';
import { UserRole } from '../../common/types';

export interface UserDocument {
  businessId: Schema.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, default: 'demo-password' },
    role: { type: String, enum: ['owner', 'staff', 'admin'], required: true, default: 'staff' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = model<any>('User', userSchema);
