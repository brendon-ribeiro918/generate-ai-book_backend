
require("dotenv").config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
const allRoutes = require('./routes');
app.use('/', allRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
