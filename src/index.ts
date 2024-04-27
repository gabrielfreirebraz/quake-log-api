import express, { Request, Response } from 'express'

const app = express();


app.get('/api', (request: Request, response: Response) => {

    response.status(200).send({message: 'ok'})
});

app.listen(3000, () => {

    console.log('api running');
});