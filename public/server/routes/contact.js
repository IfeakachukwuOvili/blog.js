const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Import the Contact model

// Example GET route to render the form
router.get('/contact', (req, res) => {
    res.render('contact', { data: null });
});

// Example POST route to handle form submission
router.post('/contact', async (req, res) => {
    const newContact = new Contact({
        name: req.body.title, // Assuming the user's name is entered in the title field
        message: req.body.body
    });

    try {
        // Save the new contact message to the database
        await newContact.save();
        res.send('Form submission received and saved');
    } catch (error) {
        res.status(500).send('Error saving data');
    }
});

module.exports = router;
