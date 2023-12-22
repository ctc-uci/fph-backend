const express = require('express');
const { db } = require('../server/db');

const donationRouter = express.Router();

donationRouter.get('/', async (req, res) => {
  try {
    const donations = await db.query(`
      SELECT * FROM donation_tracking;
    `);
    res.status(200).send(donations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await db.query('SELECT * FROM donation_tracking WHERE donation_id = $(id)', {
      id,
    });
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.put('/:donationID', async (req, res) => {
  try {
    const { donationId } = req.params;

    const { businessId, foodBankDonation, reporter, email } = req.body;

    const updatedDonation = await db.query(
      `UPDATE donation_tracking SET
      donation_id = $(donationID)
      ${businessId ? `, business_id = $(businessID) ` : ''}
      ${foodBankDonation ? `, food_bank_donation = $(foodBankDonation) ` : ''}
      ${reporter ? `, reporter = $(reporter) ` : ''}
      ${email ? `, email = $(email) ` : ''}
      WHERE donation_id = $(donationID)
      RETURNING *;`,
      { businessId, donationId, foodBankDonation, reporter, email },
    );
    return res.status(200).send(updatedDonation);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = donationRouter;
