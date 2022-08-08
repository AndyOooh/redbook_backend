import nodemailer from 'nodemailer';
import { google } from 'googleapis';

import {
  EMAIL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REFRESH,
  GOOGLE_REDIRECT_URI,
  GOOGLE_OAUTH_ACCESS,
} from '../config/VARS.js';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_OAUTH_REFRESH,
});

export const sendEmail = async (receiverEmail, subject, html) => {
  // Generate the accessToken on the fly
  const accessToken = await oauth2Client.getAccessToken();

  // Create the email envelope (transport)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: EMAIL,
      clientId: GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: GOOGLE_OAUTH_REFRESH,
      accessToken: accessToken,
    },
  });

  // Create the email options and body
  const mailOptions = {
    from: EMAIL,
    to: receiverEmail,
    subject: subject,
    html: html,
  };

  // Send the email and eturn in case of error
  return await transporter.sendMail(mailOptions);
};
