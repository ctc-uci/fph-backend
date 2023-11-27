const express = require('express');
const { db } = require('../server/db');

const businessRouter = express.Router();

// GET all businesses
businessRouter.get('/', async (req, res) => {
  try {
    const allBusinesses = await db.query(`
      SELECT *
      FROM business;
    `);
    res.status(200).send(allBusinesses);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET business with matching ID
businessRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const business = await db.query(
      `
      SELECT *
      FROM business
      WHERE id = $1;  
    `,
      [id],
    );
    res.status(200).send(business);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = businessRouter;
