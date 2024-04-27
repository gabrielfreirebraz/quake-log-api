import { Request, Response } from 'express'
import { QuakeLogModel } from '../models/quakeLogModel'

export class QuakeLogController {

    async parse(request: Request, response: Response) {

        
        await (new QuakeLogModel()).parseFile();

        response.status(200).send({message: 'ok'})
    }
}