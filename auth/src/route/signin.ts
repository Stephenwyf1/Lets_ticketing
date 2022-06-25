import express,{ Request,Response } from 'express';
import {body} from "express-validator";
import {BadRequestError,requestValidator} from '@wyf-ticketing/wyf';
import {User} from "../models/User";
import {PasswordUtils} from "../tools/PasswordUtils";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/api/users/signin',
    [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password must not be Empty!')
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 and 20 CH')
    ],
    requestValidator,
    async (req:Request,res:Response) => {
        const {email,password} = req.body;
        const existingUser = await User.findOne({email});
        if(!existingUser){
            throw new BadRequestError('User doesn\'t exist!');
        }
        const isMatch = await PasswordUtils.compare(
            existingUser.password,
            password
        );
        if(!isMatch){
            throw new BadRequestError('Wrong password, please try again.');
        }

        const userJWT = jwt.sign({
            id:existingUser.id,
            email:existingUser.email
        },process.env.JWT_SECRET!);
        // add JWT to Cookie field
        req.session = {jwt:userJWT};
        res.send(existingUser);
    }
);

export { router as signInRouter };