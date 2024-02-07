
const express = require('express');
const router = express.Router();
const {checkStatus, generateBook} = require("../controllers");

// Check the connection between frontend and backend.
router.get('/', checkStatus);

// Handle the generation request
router.post('/api/generate-book', generateBook);

module.exports = router;