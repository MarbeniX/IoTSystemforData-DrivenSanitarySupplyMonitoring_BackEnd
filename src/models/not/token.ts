import mongoose from "mongoose";
import mgongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
    token: string;
    createdAt: Date;
    userId: Types.ObjectId;
}

const TokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // 10 minutes
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Token = mongoose.model<IToken>("Token", TokenSchema);
export default Token;
