import express from 'express';
import resourceRouter from './resource.routes';

const router = express.Router();

router.use('/resources', resourceRouter);

export default router;
