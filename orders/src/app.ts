import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";
import {errorHandler,NotFoundError,currentUserVerifier} from '@wyf-ticketing/wyf';
import {deleteOrderRouter} from "./routes/delete";
import {createOrderRouter} from "./routes/create";
import {showOrderRouter} from "./routes/show";
import {indexOrderRouter} from "./routes/getAll";

const app = express();
app.set('trust proxy', true); // ?
app.use(json());
app.use(cookieSession({
    signed:false,
    secure:false
    // 此处对cookie Session secure的设置将会影响浏览器是否保存cookie
    // secure:process.env.NODE_ENV !== 'start',
}))

app.use(currentUserVerifier);
app.use(deleteOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);

app.get('*',async (req,res)=>{
    throw new NotFoundError('Not Found');
});
app.use(errorHandler);
export {app};