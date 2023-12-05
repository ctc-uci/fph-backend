const express = require('express');
const { db } = require('../server/db');

const valueRouter = express.Router();

// GET all items
valueRouter.get('/', async (req, res) => {
  try {
    const allItems = await db.query(`SELECT * FROM fair_market_value;`);
    res.status(200).send(allItems);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET all values by item id
valueRouter.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await db.query('SELECT * FROM fair_market_value WHERE item_id = $(itemId)', {
      itemId,
    });
    res.status(200).send(item);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE a new item
valueRouter.post('/', async (req, res) => {
  try {
    const { itemId, itemName, quantityType, quantity, price } = req.body;
    if (!itemId) throw new Error('Item ID is required.');
    if (!itemName) throw new Error('Item name is required.');
    if (!quantityType) throw new Error('Quantity type is required.');
    if (!quantity) throw new Error('Quantity is required.');
    if (!price) throw new Error('Price is required.');

    const newItem = await db.query(
      'INSERT INTO fair_market_value (item_id, item_name, quantity_type, quantity, price) VALUES ($(itemId), $(itemName), $(quantityType), $(quantity), $(price)) RETURNING *',
      { itemId, itemName, quantityType, quantity, price },
    );
    return res.status(200).send(newItem);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = valueRouter;
