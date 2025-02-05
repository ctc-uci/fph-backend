const express = require('express');
const transporter = require('../server/transporter');

const emailRouter = express.Router();

emailRouter.post('/send', async (req, res) => {
  const { email, messageHtml, subject } = req.body;
  const mail = {
    from: `${process.env.REACT_APP_EMAIL_NAME} ${process.env.REACT_APP_EMAIL_USERNAME}`,
    to: email,
    subject,
    html: messageHtml,
  };

  await transporter.sendMail(mail, (err) => {
    if (err) {
      res.status(500).send(`Transporter Error: ${err}`);
    } else {
      res.status(200).send('Transporter Backend Successfully Sent');
    }
  });
});

module.exports = emailRouter;
