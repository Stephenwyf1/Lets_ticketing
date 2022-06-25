import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";
import {errorHandler,NotFoundError,currentUserVerifier} from '@wyf-ticketing/wyf';
import {createTicketRouter} from "./routes/create";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes/getAll";
import {updateTicketRouter} from "./routes/update";

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.get('*',async (req,res)=>{
    throw new NotFoundError('Not Found');
});
app.use(errorHandler);
export {app};