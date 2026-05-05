import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sme_sync',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-later',
};
