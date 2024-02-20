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
    const { item_name: itemName, quantity_type: quantityType, price, category } = req.body;
    await db.query(
      'INSERT INTO fair_market_value (item_name, quantity_type, price, category) VALUES ($(itemName), $(quantityType), $(price), $(category)) RETURNING *',
      { itemName, quantityType, price, category },
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET values by category
valueRouter.get('/filter/:category', async (req, res) => {
  try {
    const { category } = req.params;
    let query = 'SELECT * FROM fair_market_value';
    if (category && category !== 'all') {
      query += ' WHERE category = $(category)';
    }
    const items = await db.query(query, {
      category,
    });
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = valueRouter;
