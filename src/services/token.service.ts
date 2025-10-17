import Token, { IToken } from "../models/token";
import { IUser } from "../models/user";
import { generateToken } from "../util/generateToken";

enum Option {
    Register = "Register",
    ForgotPassword = "ForgotPassword",
}

interface ITokenService {
    userId: IUser["_id"];
    userEmail: IUser["email"];
    option: Option;
}

export const TokenService = (paylaod: ITokenService) => {
    const { userId, userEmail, option } = paylaod;
    const token = new Token({ userId });
    token.token = generateToken();
};
