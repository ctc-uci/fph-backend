const express = require('express');
const { db } = require('../server/db');

const notificationRouter = express.Router();

notificationRouter.get('/', async (req, res) => {
  try {
    const allNotifications = await db.query('SELECT * FROM notification ORDER BY timestamp DESC;');
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
  const { businessId, message, type, senderId, businessName, donationId } = req.body;
  const timestamp = new Date().toISOString('en-US', { timeZone: 'America/Los_Angeles' });
  try {
    await db.query(
      `
        INSERT INTO notification (business_id, message, timestamp, type, sender_id, business_name, donation_id)
        VALUES
        ($(businessId), $(message), $(timestamp), $(type), $(senderId), $(businessName), $(donationId));
      `,
      { businessId, message, timestamp, type, senderId, businessName, donationId },
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

  const { businessId, message, type, senderId, businessName, donationId } = req.body;
  const timestamp = new Date().toISOString('en-US', { timeZone: 'America/Los_Angeles' });

  const updateNotification = await db.query(
    `UPDATE notification SET
      notification_id = $(id)
      ${businessId ? `, business_id = $(businessId)` : ``}
      ${message ? `, message = $(message)` : ``}
      ${timestamp ? `, timestamp = $(timestamp)` : ``}
      ${type ? `, type = $(type)` : ``}
      ${senderId ? `, sender_id = $(senderId)` : ``}
      ${businessName ? `, business_name = $(businessName)` : ``},
      ${donationId ? `, donation_id = $(donationId)` : ``}
      WHERE notification_id = $(id)
      RETURNING *;`,
    {
      businessId,
      message,
      timestamp,
      id,
      senderId,
      businessName,
      donationId,
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

  const idNotification = await db.query(
    `SELECT * FROM notification WHERE business_id=0 AND sender_id=$(id) AND type='Supply Request' ORDER BY timestamp DESC;`,
    {
      id,
    },
  );
  try {
    res.status(200).send(idNotification);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = notificationRouter;
