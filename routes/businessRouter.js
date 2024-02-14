/* eslint-disable no-restricted-syntax */
// TODO: resource --> ressource is misspelled in PGAdmin
const express = require('express');
const { db } = require('../server/db');
const camelToSnakeCase = require('./utils');

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

// GET business with order by specified
businessRouter.get('/order/:column/:sortType', async (req, res) => {
  try {
    const { column, sortType } = req.params;
    const business = await db.query(
      `
      SELECT * FROM business
      ORDER BY ${column} ${sortType}
     `,
    );
    res.status(200).send(business);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//  POST add a new business
businessRouter.post('/', async (req, res) => {
  try {
    const {
      type,
      name,
      street,
      zipCode,
      state,
      qbVendorName,
      qbCityStateZip,
      primaryPhone,
      backupPhone,
      primaryEmail,
      comments,
      faxPhone,
      contactName,
      website,
      businessHours,
      findOut,
      onboardingStatus,
      joinDate,
      inputTypeStatus,
      vendorType,
      status,
      petsOfTheHomelessDiscount,
      updatedBy,
      updatedDateTime,
      syncToQb,
      veterinary,
      resource,
      food,
      donation,
      familyShelter,
      wellness,
      spayNeuter,
      financial,
      reHome,
      erBoarding,
      senior,
      cancer,
      dog,
      cat,
      fphPhone,
      contactPhone,
      webNotes,
      internalNotes,
      published,
      shelter,
      domesticViolence,
      webDateInit,
      entQb,
      serviceRequest,
      inactive,
      finalCheck,
      createdBy,
      createdDate,
      city,
    } = req.body;

    const newBusiness = await db.query(
      `INSERT INTO business (
        type, name, street, zip_code, state, qb_vendor_name, qb_city_state_zip,
        primary_phone, backup_phone, primary_email, comments, fax_phone,
        contact_name, website, business_hours, find_out, onboarding_status,
        join_date, input_type_status, vendor_type, status,
        pets_of_the_homeless_discount, updated_by, updated_date_time,
        sync_to_qb, veterinary, ressoure, food, donation, family_shelter,
        wellness, spay_neuter, financial, re_home, er_boarding, senior, cancer,
        dog, cat, fph_phone, contact_phone, web_notes, internal_notes,
        published, shelter, domestic_violence, web_date_init, ent_qb,
        service_request, inactive, final_check, created_by, created_date, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
              $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
              $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
              $45, $46, $47, $48, $49, $50, $51, $52, $53, $54)
      RETURNING *`,
      [
        type,
        name,
        street,
        zipCode,
        state,
        qbVendorName,
        qbCityStateZip,
        primaryPhone,
        backupPhone,
        primaryEmail,
        comments,
        faxPhone,
        contactName,
        website,
        businessHours,
        findOut,
        onboardingStatus,
        joinDate,
        inputTypeStatus,
        vendorType,
        status,
        petsOfTheHomelessDiscount,
        updatedBy,
        updatedDateTime,
        syncToQb,
        veterinary,
        resource,
        food,
        donation,
        familyShelter,
        wellness,
        spayNeuter,
        financial,
        reHome,
        erBoarding,
        senior,
        cancer,
        dog,
        cat,
        fphPhone,
        contactPhone,
        webNotes,
        internalNotes,
        published,
        shelter,
        domesticViolence,
        webDateInit,
        entQb,
        serviceRequest,
        inactive,
        finalCheck,
        createdBy,
        createdDate,
        city,
      ],
    );
    res.status(200).send(newBusiness);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT request
businessRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    let query = 'UPDATE business SET ';
    const updateFields = [];
    for (const [key, value] of Object.entries(fields)) {
      if (value != null) {
        updateFields.push(`${camelToSnakeCase(key)} = '${value}'`);
      }
    }
    query += updateFields.join(', ');
    query += ` WHERE id = ${id}`;

    await db.query(query);

    res.status(200).send('Update successful');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE request
businessRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE from business WHERE id = $(id)', { id });
    res.status(200).send('Deleted business');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = businessRouter;
