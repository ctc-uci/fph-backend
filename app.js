const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes
const businessRouter = require('./routes/businessRouter');
const donationRouter = require('./routes/donationRouter');
const notificationRouter = require('./routes/notificationRouter');
const valueRouter = require('./routes/valueRouter');
const businessUserRouter = require('./routes/businessUserRouter');
const adminUserRouter = require('./routes/adminUserRouter');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3001;

// const { CLIENT_HOSTNAME } = import.meta.env;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`
        : // : `${CLIENT_HOSTNAME}`,
          `${'http://fph-frontend-prod.s3-website-us-west-1.amazonaws.com/'}`,

    credentials: true,
  }),
);

app.use('/business', businessRouter);
app.use('/donation', donationRouter);
app.use('/notification', notificationRouter);
app.use('/value', valueRouter);
app.use('/businessUser', businessUserRouter);
app.use('/adminUser', adminUserRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
