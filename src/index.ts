import express from 'express'
import cors from 'cors'
import { QuakeLogRoute } from './routes/quakeLogRoute';

const app = express();

app.use(express.json())
app.use(cors());
app.use("/api", QuakeLogRoute);


app.listen(3000, () => {

    console.log('api running');
});