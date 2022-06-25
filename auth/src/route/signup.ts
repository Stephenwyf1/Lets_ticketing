import express ,{Request,Response} from 'express';
import {body} from "express-validator";
import {requestValidator,BadRequestError} from '@wyf-ticketing/wyf';
import {User} from "../models/User";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signup',
    [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('PasswordUtils must be between 4 and 20 CH')
    ],
   requestValidator,
   async (req: Request, res: Response) => {

        const {email ,password} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser){
            throw new BadRequestError('Email in use');
        }

        const user = User.build({email,password});
        await user.save();

        // generate JWT
        const userJWT = jwt.sign({
           id:user.id,
           email:user.email
        },process.env.JWT_SECRET!);

        // In my view, this can't be valid as soon as
        // a user was created, it should be valid in sign
        // in the process.
        // add JWT to Cookie field
        req.session = {jwt:userJWT};

        res.status(201).send(user);
        // console.log("Creating User.");
        // throw new Error("WTF!");
        // res.send({});
    });

export { router as signUpRouter };