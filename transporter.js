const nodemailer = require('nodemailer');

require('dotenv').config();

// sender information
const transport = {
  service: 'gmail',
  host: 'smtp.gmail.com', // e.g. smtp.gmail.com
  secure: false,
  auth: {
    user: process.env.REACT_APP_EMAIL_USERNAME,
    pass: process.env.REACT_APP_EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(transport);

module.exports = transporter;
