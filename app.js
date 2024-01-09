const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes
const businessRouter = require('./routes/businessRouter');
const donationRouter = require('./routes/donationRouter');
const notificationRouter = require('./routes/notificationRouter');
const valueRouter = require('./routes/valueRouter');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use('/business', businessRouter);
app.use('/donation', donationRouter);
app.use('/notification', notificationRouter);
app.use('/value', valueRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
