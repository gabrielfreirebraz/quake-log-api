import { Request, Response } from 'express'
import { processDataReport } from '../services/logReportService';
import { IGameReport } from '../@types';
import { processPlayerRanking } from '../services/playerRankingService';


export const logReportController = async (request: Request, response: Response) => {
    const ReportService: IGameReport = await processDataReport();

    response.status(200).send( ReportService )
}

export const playerRankingController = async (request: Request, response: Response) => {
    const PlayerRankingService = await processPlayerRanking();
    
    response.status(200).send( PlayerRankingService )
}