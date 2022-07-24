import express from 'express';
import cors from 'cors';

import { corsConfig } from './config/cors.js';
import { db_connect } from './config/mongoose.js';
import { PORT } from './config/VARS.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsConfig));

app.use('/api', apiRoutes);

app.use(errorHandler);

await db_connect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
