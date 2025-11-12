import mongoose, { Document, Types } from "mongoose";



export interface IRevokeToken extends Document {
  token: string;
  expiredAt: Date;
}

const revokeTokenSchema = new mongoose.Schema<IRevokeToken>(
   {
    token: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);


export const RevokeTokenModel =
  mongoose.model<IRevokeToken>("RevokeToken",revokeTokenSchema) ||
  mongoose.models.RevokeToken;
