const express = require('express');
const Class = require('../models/Class');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const class_ = await Class.getById(req.params.id);
    if (class_) {
      res.json(class_);
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class' });
  }
});

// Add more routes as needed

module.exports = router;