import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { corsConfig } from './config/cors.js';
import { db_connect } from './config/mongoose.js';
import { LOG_SETTING, NODE_ENV, PORT } from './config/VARS.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.routes.js';
import morgan from 'morgan';

const app = express();

app.use(cors(corsConfig));
app.use(morgan(LOG_SETTING));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(multiUploader); // Prob best to only use oon routes which expect multi-form data.

//middleware for cookies
app.use(cookieParser());

app.use('/', apiRoutes);

app.use(errorHandler);

await db_connect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${NODE_ENV})`);
});
