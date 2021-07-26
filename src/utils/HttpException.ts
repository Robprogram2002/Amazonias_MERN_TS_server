class HttpException extends Error {
  status: number;

  data: any[] | null;

  message: string;

  constructor(status: number, message: string, data: any[] | null = null) {
    super();
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export default HttpException;
