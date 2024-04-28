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

const generateWhereClause = (search) => {
  const columns = ['name', 'email', 'last_updated'];
  let searchWhereClause = '';

  if (search.length > 0) {
    searchWhereClause = `${` WHERE `}`;
    searchWhereClause += columns
      .map((column) => {
        return `CAST(${column} AS TEXT) ILIKE '%' || $(search) || '%'`;
      })
      .join(' OR ');
  }
  return { searchWhereClause };
};

adminUserRouter.get('/totalValues', async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const search = searchTerm.split('+').join(' ');
    const { searchWhereClause } = generateWhereClause(search);
    const totalSites = await db.query(
      `
        SELECT COUNT(*)
        FROM public.admin_users
        ${searchWhereClause};
      `,
      { search },
    );
    res.status(200).send(totalSites);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

adminUserRouter.get('/paginate', async (req, res) => {
  try {
    const { itemsLimit, pageNum, searchTerm } = req.query;
    const search = searchTerm.split('+').join(' ');
    const { searchWhereClause } = generateWhereClause(search);
    const admins = await db.query(
      `
      SELECT *
      from public.admin_users
      ${searchWhereClause}
      ORDER BY email
      ${itemsLimit ? ` LIMIT ${itemsLimit}` : ''}
      ${pageNum ? ` OFFSET ${(pageNum - 1) * itemsLimit}` : ''};
    `,
      { search, itemsLimit, pageNum },
    );
    res.status(200).send(admins);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

adminUserRouter.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await db.query(
      `
      SELECT *
      FROM admin_users
      WHERE email = $1;
    `,
      [email],
    );
    res.status(200).json(user);
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
