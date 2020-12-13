import express from 'express';
import getPipelines from './getpipelines';

const router = express.Router();

router.get('/', function(req, res){
    res.json(getPipelines());
});

export default router;
