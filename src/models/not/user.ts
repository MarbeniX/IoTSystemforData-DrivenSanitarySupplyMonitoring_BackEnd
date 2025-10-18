import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    active: boolean;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
