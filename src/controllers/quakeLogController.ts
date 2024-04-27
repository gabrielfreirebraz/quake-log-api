import { Request, Response } from 'express'

export class QuakeLogController {

    public parse(request: Request, response: Response): void {

        response.status(200).send({message: 'ok'})
    }
}