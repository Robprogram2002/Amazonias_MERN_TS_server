import { Response } from 'express';
import HttpException from './HttpException';

interface ErrorResponse {
  status: number;
  message: string;
  data: any[] | null;
}

export default (error: HttpException, res: Response) => {
  const resObject: ErrorResponse = {
    status: error.status || 500,
    message: error.message || 'Something went wrong',
    data: null,
  };

  if (error.data) resObject.data = error.data;

  res.status(resObject.status).json(resObject);
};
