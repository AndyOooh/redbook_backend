import mongoose from 'mongoose';
import { DB_NAME_DEV, DB_NAME_PROD, DB_PASSWORD, DB_USER, NODE_ENV } from './VARS.js';

const db_name = NODE_ENV === 'production' ? DB_NAME_PROD : DB_NAME_DEV;

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.gnahzx2.mongodb.net/${db_name}?retryWrites=true&w=majority`;
// const MONGO_URI_NodeV2 = `mongodb://${DB_USER}:${DB_PASSWORD}@ac-cc0bugv-shard-00-00.gnahzx2.mongodb.net:27017,ac-cc0bugv-shard-00-01.gnahzx2.mongodb.net:27017,ac-cc0bugv-shard-00-02.gnahzx2.mongodb.net:27017/${db_name}?ssl=true&replicaSet=atlas-14mrfm-shard-0&authSource=admin&retryWrites=true&w=majority`

export const db_connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
    });
    const readyState = mongoose.connection.readyState;
    console.log('readyState', readyState);
    readyState === 1
      ? console.log('MongoDB is connected')
      : console.log('MongoDB is not connected');
    // return conection;
  } catch (error) {
    console.log('Mongo not connected', error);
    // res.status(500);
    // error.message = 'Error connecting to database';
    // next(error);
  }
};

// export const defaultDeselects = ['-password', '-__v']; Was meant instead of createUserObject in auth.helpers.js
