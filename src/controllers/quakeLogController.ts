import { Request, Response } from 'express'
import { QuakeLogModel } from '../models/quakeLogModel'

export class QuakeLogController {

    async logReport(request: Request, response: Response) {
        
        const Model = new QuakeLogModel();
        const Report = await Model.logReport();

        response.status(200).send(Report)
    }

    async playerRanking(request: Request, response: Response) {
        
        const Model = new QuakeLogModel();
        const Ranking = await Model.playerRanking();

        response.status(200).send(Ranking)
    }
}