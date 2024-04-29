import { Router } from 'express'
import { QuakeLogController } from '../controllers/quakeLogController';

const QuakeLogRoute = Router();

const QuakeLog = new QuakeLogController();


QuakeLogRoute.get('/report', QuakeLog.parseLogToReport);
QuakeLogRoute.get('/ranking', QuakeLog.parseLogToRanking);


export { QuakeLogRoute };