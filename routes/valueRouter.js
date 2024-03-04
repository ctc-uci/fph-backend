const express = require('express');
const { db } = require('../server/db');

const valueRouter = express.Router();

// GET all items without filtering
valueRouter.get('/', async (req, res) => {
  try {
    const items = await db.query(`SELECT * FROM fair_market_value;`);
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

valueRouter.get('/totalValues', async (req, res) => {
  try {
    const { category } = req.query;
    const categoryWhereClause =
      category && category !== 'all' ? `WHERE category='${category}'` : '';

    const totalSites = await db.query(`
      SELECT COUNT(*)
      FROM fair_market_value
      ${categoryWhereClause}
    `);
    res.status(200).send(totalSites);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET all items WITH PAGINATION
valueRouter.get('/paginate', async (req, res) => {
  try {
    const { itemsLimit, pageNum, category } = req.query;
    const categoryWhereClause =
      category && category !== 'all' ? `WHERE category='${category}'` : '';
    const allItems = await db.query(
      `
      SELECT *
      FROM fair_market_value
      ${categoryWhereClause}
      ORDER BY item_id
      ${itemsLimit ? ` LIMIT ${itemsLimit}` : ''}
      ${pageNum ? ` OFFSET ${(pageNum - 1) * itemsLimit}` : ''};`,
      { itemsLimit, pageNum },
    );
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
    const { itemName, quantityType, price, category } = req.body;
    const item = await db.query(
      'INSERT INTO fair_market_value (item_name, quantity_type, price, category) VALUES ($(itemName), $(quantityType), $(price), $(category)) RETURNING *',
      { itemName, quantityType, price, category },
    );
    res.status(200).send(item);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// edit item
valueRouter.put('/:id', async (req, res) => {
  const { id } = req.params;

  const { itemName, quantityType, price, category } = req.body;

  const updateItem = await db.query(
    `UPDATE fair_market_value SET
      item_id = $(id)
      ${itemName ? `, item_name = $(itemName)` : ``}
      ${quantityType ? `, quantity_type = $(quantityType)` : ``}
      ${price ? `, price = $(price)` : ``}
      ${category ? `, category = $(category)` : ``}
      WHERE item_id = $(id)
      RETURNING *;`,
    {
      itemName,
      quantityType,
      price,
      category,
      id,
    },
  );
  try {
    return res.status(200).send(updateItem[0]);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

valueRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const msg = await db.query(
      `
      DELETE
      FROM fair_market_value
      WHERE item_id = $(id)
      `,
      { id },
    );
    res.status(200).send(msg);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = valueRouter;
