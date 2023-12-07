const express = require('express');
const { db } = require('../server/db');

const valueRouter = express.Router();

valueRouter.get('/', async (req, res) => {
  try {
    const allValues = await db.query(`
        SELECT *
        FROM donation_tracking;
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

        WHERE id = $(id)
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

module.exports = valueRouter;
