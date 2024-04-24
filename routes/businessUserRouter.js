const express = require('express');
const { db } = require('../server/db');

const businessUserRouter = express.Router();

// POST request to add a new business user
businessUserRouter.post('/', async (req, res) => {
  const { id, uid } = req.body;
  try {
    // Insert the new user into the database
    await db.query('INSERT INTO public.business_users (id, uid) VALUES ($1, $2)', [id, uid]);
    res.status(201).send('User added successfully');
  } catch (error) {
    res.status(400).send(`Error adding user: ${error.message}`);
  }
});

// GET request to fetch a business user by UID
businessUserRouter.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    // Retrieve the user from the database
    const result = await db.query('SELECT * FROM public.business_users WHERE uid = $(uid)', {
      uid,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(`Error retrieving user: ${error.message}`);
  }
});

module.exports = businessUserRouter;