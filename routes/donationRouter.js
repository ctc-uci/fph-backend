/* eslint-disable camelcase */
const express = require('express');
const { db } = require('../server/db');

const donationRouter = express.Router();

// GET all donations
donationRouter.get('/', async (req, res) => {
  try {
    const donation = await db.query('SELECT * FROM donation_tracking');
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET donation by id
donationRouter.get('/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await db.query(
      'SELECT * FROM donation_tracking WHERE donation_id = $(donationId)',
      {
        donationId,
      },
    );
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const donation = await db.query(
      'SELECT * FROM donation_tracking WHERE business_id = $(businessId)',
      {
        businessId,
      },
    );
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.get('/business/totals/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const donation = await db.query(
      `
      SELECT
      CAST(SUM (d.canned_dog_food_quantity) AS int) canned_dog_food_quantity,
      CAST(SUM (d.dry_dog_food_quantity) AS int) dry_dog_food_quantity,
      CAST(SUM (d.canned_cat_food_quantity) AS int) canned_cat_food_quantity,
      CAST(SUM (d.dry_cat_food_quantity) AS int) dry_cat_food_quantity
      FROM donation_tracking d
      WHERE business_id = $(businessId);
      `,
      {
        businessId,
      },
    );
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route for filtering donations made in the last month
donationRouter.get('/filter/month', async (req, res) => {
  try {
    const filterDonationSites = await db.query(
      `
      SELECT * FROM donation_tracking
      WHERE date > current_date - interval '1 month'
      `,
    );
    res.status(200).send(filterDonationSites);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route for filtering donations made in the last quarter
donationRouter.get('/filter/quarter', async (req, res) => {
  try {
    const filterDonationSites = await db.query(
      `
      SELECT * FROM donation_tracking
      WHERE date > current_date - interval '3 months'
      `,
    );
    res.status(200).send(filterDonationSites);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route for filtering donations made in the last year
donationRouter.get('/filter/year', async (req, res) => {
  try {
    const filterDonationSites = await db.query(
      `
      SELECT * FROM donation_tracking
      WHERE date > current_date - interval '1 year'
      `,
    );
    res.status(200).send(filterDonationSites);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route for getting all donation records without date filtering
donationRouter.get('/filter/all', async (req, res) => {
  try {
    const filterDonationSites = await db.query(
      `
      SELECT * FROM donation_tracking
      `,
    );
    res.status(200).send(filterDonationSites);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// POST a new donation
donationRouter.post('/', async (req, res) => {
  try {
    const {
      business_id,
      food_bank_donation,
      reporter,
      email,
      date,
      canned_dog_food_quantity,
      dry_dog_food_quantity,
      canned_cat_food_quantity,
      dry_cat_food_quantity,
      misc_items,
      volunteer_hours,
    } = req.body;

    if (!business_id) throw new Error('Business ID is required.');
    if (!food_bank_donation) throw new Error('Food bank donation is required.');
    if (!reporter) throw new Error('Reporter is required.');
    if (!email) throw new Error('Email is required.');
    if (!date) throw new Error('Date is required.');

    const newFacility = await db.query(
      'INSERT INTO donation_tracking (business_id, food_bank_donation, reporter, email, date, canned_dog_food_quantity, dry_dog_food_quantity, canned_cat_food_quantity, dry_cat_food_quantity, misc_items, volunteer_hours) VALUES ($(business_id), $(food_bank_donation), $(reporter), $(email), $(date), $(canned_dog_food_quantity), $(dry_dog_food_quantity), $(canned_cat_food_quantity), $(dry_cat_food_quantity), $(misc_items), $(volunteer_hours)) RETURNING *',
      {
        business_id,
        food_bank_donation,
        reporter,
        email,
        date,
        canned_dog_food_quantity,
        dry_dog_food_quantity,
        canned_cat_food_quantity,
        dry_cat_food_quantity,
        misc_items,
        volunteer_hours,
      },
    );
    return res.status(200).send(newFacility);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

donationRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE from donation_tracking WHERE donation_id = $1;', [id]);
    res.status(200).send('Deleted donation');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      businessId,
      foodBankDonation,
      reporter,
      email,
      date,
      cannedDogFoodQuantity,
      dryDogFoodQuantity,
      cannedCatFoodQuantity,
      dryCatFoodQuantity,
      miscItems,
      volunteerHours,
    } = req.body;

    const updatedValue = await db.query(
      `UPDATE donation_tracking
        SET donation_id = $(id)
        ${businessId ? `, business_id = $(businessId) ` : ''}
        ${foodBankDonation ? `, food_bank_donation = $(foodBankDonation) ` : ''}
        ${reporter ? `, reporter = $(reporter) ` : ''}
        ${email ? `, email = $(email) ` : ''}
        ${date ? `, date = $(date) ` : ''}
        ${cannedDogFoodQuantity ? `, canned_dog_food_quantity = $(cannedDogFoodQuantity) ` : ''}
        ${dryDogFoodQuantity ? `, dry_dog_food_quantity = $(dryDogFoodQuantity) ` : ''}
        ${cannedCatFoodQuantity ? `, canned_cat_food_quanitty = $(cannedCatFoodQuanitty) ` : ''}
        ${dryCatFoodQuantity ? `, dry_cat_food_quantity = $(dryCatFoodQuantity) ` : ''}
        ${miscItems ? `, misc_items = $(miscItems) ` : ''}
        ${volunteerHours ? `, volunteer_hours = $(volunteerHours) ` : ''}
        WHERE donation_id = $(id)
        RETURNING *;`,
      {
        id,
        businessId,
        foodBankDonation,
        reporter,
        email,
        date,
        cannedDogFoodQuantity,
        dryDogFoodQuantity,
        cannedCatFoodQuantity,
        dryCatFoodQuantity,
        miscItems,
        volunteerHours,
      },
    );
    return res.status(200).send(updatedValue);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = donationRouter;
