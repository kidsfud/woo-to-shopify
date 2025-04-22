const express = require('express');
require('dotenv').config();
const wooToShopify = require('./woo-to-shopify');
const shopifyToWoo = require('./shopify-to-woo');

const app = express();
const PORT = process.env.PORT || 3000;

// Optional: Create simple health route
app.get('/', (req, res) => {
  res.send('Woo to Shopify Sync is running!');
});

// Run sync periodically (e.g. every 5 mins)
setInterval(() => {
  wooToShopify();
  shopifyToWoo();
}, 5 * 60 * 1000); // 5 minutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
