import { Request, Response } from 'express'
import { QuakeLogModel } from '../models/quakeLogModel'

export class QuakeLogController {

    async parseLogToReport(request: Request, response: Response) {
        
        const resp = await (new QuakeLogModel()).parseLogToReport();

        response.status(200).send(resp)
    }

    async parseLogToRanking(request: Request, response: Response) {
        
        const resp = await (new QuakeLogModel()).parseLogToRanking();

        response.status(200).send(resp)
    }
}