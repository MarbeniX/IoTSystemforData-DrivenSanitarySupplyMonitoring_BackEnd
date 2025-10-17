import { Request, Response } from "express";
import User from "../models/user";
import { UserService } from "../services/user.service";
import { hashPassword } from "../util/userPassword.bcrypt";

export class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const userExists = await UserService.userExistsByEmail(email);
            if (userExists) {
                const error = new Error("User already exists");
                return res.status(400).send({ error: error.message });
            }
            const newUser = new User({ email });
            newUser.password = await hashPassword(password);
        } catch (error) {}
    };
}
2;
