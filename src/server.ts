import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// routes
import authRoutes from './routes/authRoutes';
import departmentRoutes from './routes/departmentRoutes';
import categoryRoutes from './routes/categoryRoutes';
import subcategoryRoutes from './routes/subcategoryRoutes';
import imageRoutes from './routes/imageRoutes';
import productRoutes from './routes/productRoutes';

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
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sub-categories', subcategoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/products', productRoutes);

// catch request made to no api end point
app.use('/', (req: Request, res: Response) => {
  res.status(404).json('sorry, not api end point was reached');
});

export default app;
