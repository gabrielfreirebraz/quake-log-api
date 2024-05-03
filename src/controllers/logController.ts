import { Request, Response } from 'express'
import { QuakeLogModel } from '../models/logReportModel'
import { processDataFromFile } from '../services/logReportService';

export class QuakeLogController {

    async logReport(request: Request, response: Response) {
       const ReportService = await processDataFromFile();

        response.status(200).send( ReportService )
    }

    async playerRanking(request: Request, response: Response) {
        response.status(404).send({})

        const Model = new QuakeLogModel();
        const Ranking = await Model.playerRanking();
        response.status(200).send(Ranking)
    }
}