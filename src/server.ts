import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';

// app
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    optionsSuccessStatus: 200,
  })
);

app.use('/api/auth', authRoutes);

// catch request made to no api end point
app.use('/', (req: Request, res: Response) => {
  res.status(404).json('sorry, not api end point was reached');
});

export default app;
