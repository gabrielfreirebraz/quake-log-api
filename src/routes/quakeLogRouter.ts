import { Router } from 'express'
import { logReportController, playerRankingController } from '../controllers/quakeLogController';

const quakeLogRouter = Router();

quakeLogRouter.get('/report', logReportController);
quakeLogRouter.get('/ranking', playerRankingController);


export { quakeLogRouter };