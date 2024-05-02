import { Request, Response } from 'express'
import { QuakeLogModel } from '../models/quakeLogModel'
import { processDataFromFile } from '../services/quakeLogService';

export class QuakeLogController {

    async logReport(request: Request, response: Response) {
        
        //const Model = new QuakeLogModel();
        // const Report = await Model.logReport();
       const Report = await processDataFromFile();

        response.status(200).send( Report )
    }

    async playerRanking(request: Request, response: Response) {
        response.status(404).send({})

        const Model = new QuakeLogModel();
        const Ranking = await Model.playerRanking();
        response.status(200).send(Ranking)
    }
}