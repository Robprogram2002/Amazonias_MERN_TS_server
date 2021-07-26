import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './server';

const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URI || '';

dotenv.config();

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
