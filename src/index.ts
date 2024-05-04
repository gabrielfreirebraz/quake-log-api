import express from 'express'
import cors from 'cors'
import helmet from "helmet";
import 'dotenv/config'
import { quakeLogRouter } from './routes/quakeLogRouter';
import { limiter } from './utils/limiter';
import { httpErrors } from './middlewares/httpErrors';

const app = express();

app.use(limiter);
app.use(httpErrors);
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use("/api", quakeLogRouter);


app.listen(process.env.PORT || 3000, () => {

    console.log('api quake log running');
});