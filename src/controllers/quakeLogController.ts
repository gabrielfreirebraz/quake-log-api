import { NextFunction, Request, Response } from 'express'
import { processDataReport } from '../services/logReportService';
import { IGameReport } from '../@types';
import { processPlayerRanking } from '../services/playerRankingService';
import { logger } from '../utils/logger';


export const logReportController = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const ReportService: IGameReport = await processDataReport();
        response.status(200).send( ReportService )

    } catch (err) {
        logger.error('Error in route /report %s', err);
        next(err); // Encaminha o erro para o middleware de tratamento de erros
    }
}

export const playerRankingController = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const PlayerRankingService = await processPlayerRanking();    
        response.status(200).send( PlayerRankingService )

    } catch (err) {
        logger.error('Error in route /ranking %s', err);
        next(err); // Encaminha o erro para o middleware de tratamento de erros
    }
}