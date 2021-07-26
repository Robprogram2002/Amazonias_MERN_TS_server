import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  collections.forEach(async (collectionName) => {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  });
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);

  try {
    await Promise.all(
      collections.map(async (collectionName) => {
        const collection = mongoose.connection.collections[collectionName];
        return collection.drop();
      })
    );

    await mongoose.connection.close();
  } catch (error) {
    // Sometimes this error happens, but you can safely ignore it
    if (error.message === 'ns not found') return;
    // This error occurs when you use it.todo. You can
    // safely ignore this error too
    if (error.message.includes('a background operation is currently running'))
      return;
    console.log(error.message);
  }
}

export default {
  setupDB(databaseName: string) {
    // Connect to Mongoose
    beforeAll(async () => {
      const url = `mongodb://127.0.0.1/${databaseName}`;
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
    });

    // Cleans up database between each test

    // Disconnect Mongoose
    afterAll(async () => {
      await dropAllCollections();
    });
  },
};
