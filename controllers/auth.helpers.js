import { FRONTEND_URL, REFRESH_TOKEN_SECRET } from '../config/VARS.js';
import { generateToken } from '../services/token.service.js';

export const verificationEmailOPtions = (id, first_name) => {
  const subject = 'Redbook account activation';
  const tokenSecret = REFRESH_TOKEN_SECRET;
  const verificationToken = generateToken({ id }, tokenSecret, '7d');
  // const verificationLink = `${FRONTEND_URL}/activate?activationToken=${verificationToken}`;
  const verificationLink = `${FRONTEND_URL}/verify?verificationToken=${verificationToken}`;
  const html = `<div style="max-width:70rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:3rem"><span>Action required : Activate your Redbook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${first_name}</span><div style="padding:2rem 0"><span style="padding:1.5rem 0">You recently created an account on Redbook. To complete your registration, please confirm your account.</span></div><a href=${verificationLink} style="width:20rem;padding:1rem 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a><br><div style="padding-top:2rem"><span style="margin:1.5rem 0;color:#898f9c">Redbook allows you to stay in touch with all your friends, once registered on Redbook, you can share photos, organize events and much more.</span></div></div>`;

  return {
    subject,
    html,
  };
};

export const resetCodeEmailOptions = (first_name, code) => {
  const subject = 'Reset facebook password';
  const html = `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:30px"><span>Action requise : Activate your facebook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${first_name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently created an account on Facebook. To complete your registration, please confirm your account.</span></div><a  style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">${code}</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook allows you to stay in touch with all your friends, once registered on facebook, you can share photos, organize events and much more.</span></div></div>`;
  return {
    subject,
    html,
  };
};

export const createUserObject = user => {
  const { _id: id, password, refreshToken, details, createdAt, updatedAt, __v, ...rest } = user;

  return {
    id,
    password,
    refreshToken,
    details,
    createdAt,
    updatedAt,
    __v,
    rest,
  };
};

export const generateCode = length => {
  let code = '';
  let schema = '0123456789';

  for (let i = 0; i < length; i++) {
    code += schema.charAt(Math.floor(Math.random() * schema.length));
  }
  return code;
};
