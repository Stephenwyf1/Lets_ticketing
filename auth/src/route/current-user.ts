import express from 'express';
import {currentUserVerifier} from '@wyf-ticketing/wyf'

const router = express.Router();

router.get('/api/users/currentUser',currentUserVerifier, (req,res)=>{
    res.send({ currentUser:req.currentUser || null });
});

export { router as currentUserRouter };