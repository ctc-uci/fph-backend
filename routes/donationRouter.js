/* eslint-disable camelcase */
const express = require('express');
const { db } = require('../server/db');

const donationRouter = express.Router();

// GET all donations
donationRouter.get('/', async (req, res) => {
  try {
    const { itemsLimit, pageNum } = req.query;

    const donation = await db.query(
      `
      SELECT *
      FROM donation_tracking
      ${itemsLimit ? `LIMIT ${itemsLimit}` : ''}
      ${pageNum ? `OFFSET ${(pageNum - 1) * itemsLimit}` : ''};`,
      { itemsLimit, pageNum },
    );
    res.status(200).send(donation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

donationRouter.get('/totalDonations', async (req, res) => {
  try {
    const totalSites = await db.query(`
      SELECT COUNT(*)
      FROM donation_tracking
    `);
    res.status(200).send(totalSites);
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

// Generates the WHERE clause for the filter and search for totalDonations and filteredDonations routes
const generateWhereClause = (filter, search) => {
  const columns = [
    'business_id',
    'donation_id',
    'food_bank_donation',
    'reporter',
    'email',
    'date',
    'canned_dog_food_quantity',
    'dry_dog_food_quantity',
    'canned_cat_food_quantity',
    'dry_cat_food_quantity',
    'misc_items',
    'volunteer_hours',
  ];
  let filterQuery = '';
  if (filter !== 'all') {
    if (filter === 'month') {
      filterQuery = "'1 month'";
    } else if (filter === 'quarter') {
      filterQuery = "'3 months'";
    } else {
      filterQuery = "'1 year'";
    }
  }
  const tabsWhereClause = filterQuery ? `WHERE date > current_date - interval ${filterQuery}` : '';
  let searchWhereClause = '';
  if (search.length > 0) {
    searchWhereClause = `${tabsWhereClause ? ` AND ` : ` WHERE `}`;
    searchWhereClause += columns
      .map((column) => {
        return `CAST(${column} AS TEXT) ILIKE '%' || $(search) || '%'`;
      })
      .join(' OR ');
  }
  return { tabsWhereClause, searchWhereClause };
};

// Route for getting total number of donations by filter
donationRouter.get('/totalDonations/:filter', async (req, res) => {
  try {
    const { filter } = req.params;
    const { searchTerm } = req.query;
    const search = searchTerm.split('+').join(' ');
    const { tabsWhereClause, searchWhereClause } = generateWhereClause(filter, search);
    const numDonations = await db.query(
      `
      SELECT COUNT(*)
      from donation_tracking
      ${tabsWhereClause}
      ${searchWhereClause};
    `,
      { search },
    );
    res.status(200).send(numDonations);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET the amount of donations that fit similar to that of the searchTerm
donationRouter.get('/filter/searchCount', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const totalSites = await db.query(`
      SELECT COUNT(*)
      FROM donation_tracking
      WHERE reporter ILIKE '%${searchTerm}%'
      OR food_bank_donation ILIKE '%${searchTerm}%'
    `);
    res.status(200).send(totalSites);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET donations that fit the string to search
donationRouter.get('/filter/search', async (req, res) => {
  try {
    const { searchTerm, donationsLimit, pageNum } = req.query;
    const search = searchTerm.split('+').join(' ');
    const stringMatch = await db.query(
      `
      SELECT *
      FROM donation_tracking
      WHERE reporter ILIKE '%${search}%'
        OR food_bank_donation ILIKE '%${search}%'
      ${donationsLimit ? ` LIMIT ${donationsLimit}` : ''}
      ${pageNum ? ` OFFSET ${(pageNum - 1) * donationsLimit}` : ''};`,
    );
    res.status(200).send(stringMatch);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route for filtering donations made in the specified time frame and paginated
donationRouter.get('/filter/:filter', async (req, res) => {
  const siteResultLimit = 10; // how many results we want to show
  try {
    let filterDonationSites = '';
    const { filter } = req.params;
    const { pageNum, searchTerm } = req.query;
    const search = searchTerm ? searchTerm.split('+').join(' ') : '';
    const page = pageNum || 1;
    const { tabsWhereClause, searchWhereClause } = generateWhereClause(filter, search);
    filterDonationSites = await db.query(
      `SELECT * FROM donation_tracking
      ${tabsWhereClause}
      ${searchWhereClause}
       ORDER BY date DESC
       LIMIT ${siteResultLimit} OFFSET ${(page - 1) * siteResultLimit}
       ;`,
      { siteResultLimit, pageNum, search },
    );
    res.status(200).send(filterDonationSites);
  } catch (error) {
    res.status(500).send(error);
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
