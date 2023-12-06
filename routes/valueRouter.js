const express = require('express');
const { db } = require('../server/db');

const valueRouter = express.Router();

valueRouter.get('/', async (req, res) => {
  try {
    const allValues = await db.query(`
        SELECT *
        FROM business;
      `);
    res.status(200).send(allValues);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

valueRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const value = await db.query(
      `
        SELECT *
        FROM donation_tracking
        WHERE donation_id = $1;  
      `,
      [id],
    );
    res.status(200).send(value);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

valueRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE from donation_tracking WHERE donation_id = $1;', [id]);
    res.status(200).send('Deleted donation');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

valueRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      business_id,
      donation_id,
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
    if (!business_id) throw new Error('business_id is required.');
    if (!donation_id) throw new Error('donation_id line is required.');
    if (!food_bank_donation) throw new Error('food_bank_donation is required.');
    if (!reporter) throw new Error('business_id is required.');
    if (!email) throw new Error('donation_id line is required.');
    if (!date) throw new Error('food_bank_donation is required.');
    if (!canned_dog_food_quantity) throw new Error('canned_dog_food_quantity is required.');
    if (!dry_dog_food_quantity) throw new Error('dry_dog_food_quantity line is required.');
    if (!canned_cat_food_quantity) throw new Error('canned_cat_food_quanitty is required.');
    if (!dry_cat_food_quantity) throw new Error('dry_cat_food_quantity is required.');
    if (!misc_items) throw new Error('misc_items line is required.');
    if (!volunteer_hours) throw new Error('volunteer_hours is required.');

    const updatedValue = await db.query(
      `UPDATE donation_tracking 
        SET donation_id = $(id)
        ${business_id ? `, business_id = $(business_id) ` : ''}
        ${donation_id ? `, donation_id = $(donation_id) ` : ''}
        ${food_bank_donation ? `, food_bank_donation = $(food_bank_donation) ` : ''}
        ${reporter ? `, reporter = $(reporter) ` : ''}
        ${email ? `, email = $(email) ` : ''}
        ${date ? `, date = $(date) ` : ''}
        ${
          canned_dog_food_quantity
            ? `, canned_dog_food_quantity = $(canned_dog_food_quantity) `
            : ''
        }
        ${dry_dog_food_quantity ? `, dry_dog_food_quantity = $(dry_dog_food_quantity) ` : ''}
        ${
          canned_cat_food_quantity
            ? `, canned_cat_food_quanitty = $(canned_cat_food_quanitty) `
            : ''
        }
        ${dry_cat_food_quantity ? `, dry_cat_food_quantity = $(dry_cat_food_quantity) ` : ''}
        ${misc_items ? `, misc_items = $(misc_items) ` : ''}
        ${volunteer_hours ? `, volunteer_hours = $(volunteer_hours) ` : ''}

        WHERE id = $(id)
        RETURNING *;`,
      {
        id,
        business_id,
        donation_id,
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
    return res.status(200).send(updatedValue);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = valueRouter;
