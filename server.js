import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { corsConfig } from './config/cors.js';
import { db_connect } from './config/mongoose.js';
import { LOG_SETTING, NODE_ENV, PORT } from './config/VARS.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.routes.js';
import morgan from 'morgan';

console.log('🚀 ~ file: server.js ~ line 8 ~ LOG_SETTING', LOG_SETTING)
const app = express();


app.use(cors(corsConfig));
// app.use(morgan(LOG_SETTING));
// app.use(morgan('combined'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(multiUploader); // Prob best to only use oon routes which expect multi-form data.

//middleware for cookies
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(errorHandler);

await db_connect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${NODE_ENV})`);
});
