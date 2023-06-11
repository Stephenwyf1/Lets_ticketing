import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";

import {currentUserRouter} from "./route/current-user";
import {signInRouter} from "./route/signin";
import {signUpRouter} from "./route/signup";
import {signOutRouter} from "./route/signout";
import {errorHandler,NotFoundError} from '@wyf-ticketing/wyf';

const app = express();
app.set('trust proxy', true); // ?
app.use(json());
app.use(cookieSession({
    signed:false,
    secure:false
    // 此处对cookie Session secure的设置将会影响浏览器是否保存cookie
    // secure:process.env.NODE_ENV !== 'start',
}))
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);
app.use(errorHandler);

app.get('*',async (req,res)=>{
    throw new NotFoundError('Not Found');
});

export {app};