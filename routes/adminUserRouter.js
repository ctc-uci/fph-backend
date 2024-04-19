const express = require('express');
const { db } = require('../server/db');

const adminUserRouter = express.Router();

// GET request to fetch all admin users
adminUserRouter.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM public.admin_users');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(`Error retrieving admin users: ${error.message}`);
  }
});

// POST request to add a new admin user
adminUserRouter.post('/', async (req, res) => {
  const { name, email, last_updated: lastUpdated } = req.body;
  try {
    // Insert the new user into the database
    await db.query(
      'INSERT INTO public.admin_users (name, email, last_updated) VALUES ($1, $2, $3)',
      [name, email, lastUpdated],
    );
    res.status(201).send('Admin user added successfully');
  } catch (error) {
    res.status(400).send(`Error adding admin user: ${error.message}`);
  }
});

// PUT request to update an existing admin user
adminUserRouter.put('/:email', async (req, res) => {
  const { email } = req.params;

  const { name, email: newEmail, last_updated: lastUpdated } = req.body;

  try {
    const updateAdmin = await db.query(
      `UPDATE public.admin_users SET 
        email = $(newEmail)
        ${name ? `, name = $(name)` : ``}
        ${lastUpdated ? `, last_updated = $(lastUpdated)` : ``}
        WHERE email = $(email)
        RETURNING *;`,
      {
        name,
        lastUpdated,
        newEmail,
        email,
      },
    );

    return res.status(200).send(updateAdmin[0]);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// DELETE request
adminUserRouter.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await db.query('DELETE from public.admin_users WHERE email = $(email)', { email });
    res.status(200).send('Deleted admin!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = adminUserRouter;
