import { Router } from 'express'
import { QuakeLogController } from '../controllers/quakeLogController';

const QuakeLogRoute = Router();

const QuakeLog = new QuakeLogController();


QuakeLogRoute.get('/api', QuakeLog.parse);


export { QuakeLogRoute };