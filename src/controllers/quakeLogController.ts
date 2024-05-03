import { Request, Response } from 'express'
import { processDataFromFile } from '../services/logReportService';
import { IGameReport } from '../@types';
import { QuakeLogModel } from '../models/quakeLogModel'


export const logReportController = async (request: Request, response: Response) => {
    const ReportService: IGameReport = await processDataFromFile();

    response.status(200).send( ReportService )
}

export const playerRankingController = async (request: Request, response: Response) => {
    const Model = new QuakeLogModel();
    const Ranking = await Model.playerRanking();
    
    response.status(200).send(Ranking)
}