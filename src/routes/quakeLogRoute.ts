import { Router } from 'express'
import { QuakeLogController } from '../controllers/quakeLogController';

const QuakeLogRoute = Router();
const Controller = new QuakeLogController();

QuakeLogRoute.get('/report', Controller.logReport);
QuakeLogRoute.get('/ranking', Controller.playerRanking);


export { QuakeLogRoute };