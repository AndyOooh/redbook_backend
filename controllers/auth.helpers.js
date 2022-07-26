import { FRONTEND_URL } from '../config/VARS.js';
import { generateToken } from '../services/token.service.js';

export const verificationEmailOPtions = (id, first_name) => {
  const subject = 'Redbook account activation';
  const verificationToken = generateToken({ id }, '7d');
  // const verificationLink = `${FRONTEND_URL}/activate?activationToken=${verificationToken}`;
  const verificationLink = `${FRONTEND_URL}?verificationToken=${verificationToken}`;
  const html = `<div style="max-width:70rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:3rem"><span>Action required : Activate your Redbook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${first_name}</span><div style="padding:2rem 0"><span style="padding:1.5rem 0">You recently created an account on Redbook. To complete your registration, please confirm your account.</span></div><a href=${verificationLink} style="width:20rem;padding:1rem 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a><br><div style="padding-top:2rem"><span style="margin:1.5rem 0;color:#898f9c">Redbook allows you to stay in touch with all your friends, once registered on Redbook, you can share photos, organize events and much more.</span></div></div>`;

  return {
    subject,
    html,
  };
};
