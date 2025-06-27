const pool = require('../config/db');

// 🔹 Get all contact info entries
const getAllContactInfo = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contact_info ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching contact info:', err.message);
    res.status(500).json({ error: 'Failed to fetch contact information.' });
  }
};

// 🔹 Add new contact info
const addContactInfo = async (req, res) => {
  const {
    name, address_line1, address_line2,
    city, state, country, pincode,
    phone, email, facebook_url, youtube_url, instagram_url
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contact_info (
        name, address_line1, address_line2, city, state, country, pincode,
        phone, email, facebook_url, youtube_url, instagram_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        name, address_line1, address_line2,
        city, state, country, pincode,
        phone, email, facebook_url, youtube_url, instagram_url
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error adding contact info:', err.message);
    res.status(500).json({ error: 'Failed to add contact info' });
  }
};

// 🔹 Update contact info by ID
const updateContactInfo = async (req, res) => {
  const { id } = req.params;
  const {
    name, address_line1, address_line2,
    city, state, country, pincode,
    phone, email, facebook_url, youtube_url, instagram_url
  } = req.body;

  try {
    await pool.query(
      `UPDATE contact_info SET
        name = $1, address_line1 = $2, address_line2 = $3,
        city = $4, state = $5, country = $6, pincode = $7,
        phone = $8, email = $9, facebook_url = $10,
        youtube_url = $11, instagram_url = $12
      WHERE id = $13`,
      [
        name, address_line1, address_line2,
        city, state, country, pincode,
        phone, email, facebook_url, youtube_url, instagram_url,
        id
      ]
    );
    res.json({ success: true, message: 'Contact info updated successfully' });
  } catch (err) {
    console.error('❌ Error updating contact info:', err.message);
    res.status(500).json({ error: 'Failed to update contact info' });
  }
};

// 🔹 Delete contact info by ID
const deleteContactInfo = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contact_info WHERE id = $1', [id]);
    res.json({ success: true, message: 'Contact info deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting contact info:', err.message);
    res.status(500).json({ error: 'Failed to delete contact info' });
  }
};

module.exports = {
  getAllContactInfo,
  addContactInfo,
  updateContactInfo,
  deleteContactInfo
};
