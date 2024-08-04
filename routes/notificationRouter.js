const express = require('express');
const { db } = require('../server/db');

const notificationRouter = express.Router();

notificationRouter.get('/', async (req, res) => {
  try {
    const allNotifications = await db.query('SELECT * FROM notification;');
    res.status(200).send(allNotifications);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

notificationRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idNotification = await db.query(
      'SELECT * FROM notification WHERE business_id = $(id) ORDER BY timestamp DESC;',
      {
        id,
      },
    );
    res.status(200).send(idNotification);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

notificationRouter.post('/', async (req, res) => {
  console.log(req.body);
  const timestamp = new Date();

  const { businessId, message, type, senderId, businessName, donationId } = req.body;

  try {
    await db.query(
      `
        INSERT INTO notification (business_id, message, timestamp, type, sender_id, business_name, donation_id)
        VALUES
        ($(businessId), $(message), $(timestamp), $(type), $(senderId), $(businessName), $(donationId));
      `,
      { message, businessId, timestamp, type, senderId, businessName, donationId },
    );
    res.status(200).json({
      status: 'Success',
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

notificationRouter.put('/:id', async (req, res) => {
  const { id } = req.params;

  const { business_id: businessId, message, timestamp, been_dismissed: beenDismissed } = req.body;

  const updateNotification = await db.query(
    `UPDATE notification SET
      notification_id = $(id)
      ${businessId ? `, business_id = $(businessId)` : ``}
      ${message ? `, message = $(message)` : ``}
      ${timestamp ? `, timestamp = $(timestamp)` : ``}
      ${beenDismissed ? `, been_dismissed = $(beenDismissed)` : ``}
      WHERE notification_id = $(id)
      RETURNING *;`,
    {
      businessId,
      message,
      timestamp,
      beenDismissed,
      id,
    },
  );
  try {
    return res.status(200).send(updateNotification[0]);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

notificationRouter.get('/request/:id', async (req, res) => {
  const { id } = req.params;

  const idNotification = await db.any(
    `SELECT * FROM notification WHERE business_id = $(id) AND type='Supply Request' ORDER BY timestamp DESC;`,
    { id },
  );

  try {
    res.status(200).send(idNotification);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = notificationRouter;
