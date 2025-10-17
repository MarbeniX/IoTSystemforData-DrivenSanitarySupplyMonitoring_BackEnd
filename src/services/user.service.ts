import User, { IUser } from "../models/user";

export class UserService {
    static async userExistsByEmail(email: IUser["email"]) {
        return await User.findOne({ email });
    }
}
