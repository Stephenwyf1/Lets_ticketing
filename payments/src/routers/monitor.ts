import {
    requireAuth,
    requestValidator,
} from "@wyf-ticketing/wyf";
import express, {Response, Request} from "express";
import {eventEmitter} from "../events/eventEmitter";
const router = express.Router();

router.get('/api/payments/monitor',
    requireAuth,
    requestValidator,
    (req:Request,res:Response)=>{
        res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        });

        eventEmitter.on('log', (parseData, subject) => {
            const msg = {data:parseData, event:subject};
            // console.log("EventEmitter works!!!");
            res.write(JSON.stringify(msg)+'\n');
        });

        req.on('close', () => {
            eventEmitter.removeAllListeners();
        });
    }
);

export {router as monitorRouter};