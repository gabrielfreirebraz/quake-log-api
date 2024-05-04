import express from 'express'
import cors from 'cors'
import helmet from "helmet";
import { quakeLogRouter } from './routes/quakeLogRouter';
import { limiter } from './utils/limiter';

const app = express();

app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use("/api", quakeLogRouter);


app.listen(3000, () => {

    console.log('api quake log running');
});