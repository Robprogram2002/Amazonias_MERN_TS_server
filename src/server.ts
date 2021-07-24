import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URI || '';

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
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
  })
);

// catch request made to no api end point
app.use('/', (req: Request, res: Response) => {
  res.status(404).send('sorry, not api end point was reached');
});

app.listen(PORT, async () => {
  console.log(`server running on http://localhost:${PORT}`);
  // connect to database
  mongoose
    .connect(URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('DB CONNECTED'))
    .catch((err) => console.log('DB CONNECTION ERR', err));
});
