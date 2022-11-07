import 'dotenv/config';

export const {
  NODE_ENV,
  USEEMAIL,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  DB_NAME_DEV,
  DB_NAME_PROD,
  DB_USER,
  DB_PASSWORD,
  EMAIL,
  EMAIL_PASSWORD,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REFRESH,
  // GOOGLE_OAUTH_ACCESS,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL_PROD,
  FRONTEND_URL_DEV,
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,

  // ORIGIN,
} = process.env;

export const LOG_SETTING = NODE_ENV === 'production' ? 'combined' : 'dev';
export const FRONTEND_URL =
  NODE_ENV === 'production' ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV;

// export const ORIGIN = `${BASE_URL}${PORT}`;

// console.log('process.env ORIGIN2: ', process.env.ORIGIN2); Not sure how to preload them, check dotenv-expand package.
