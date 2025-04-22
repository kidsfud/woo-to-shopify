const express = require('express');
const app = express();
require('dotenv').config();

const wooToShopify = require('./woo-to-shopify');
const shopifyToWoo = require('./shopify-to-woo');

app.use(express.json());

// Handle WooCommerce order webhooks
app.post('/webhook/woocommerce', async (req, res) => {
  try {
    console.log('WooCommerce webhook received');
    await wooToShopify(req.body);  // Pass order payload
    res.status(200).send('Woo sync triggered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error handling WooCommerce webhook');
  }
});

// Handle Shopify order webhooks
app.post('/webhook/shopify', async (req, res) => {
  try {
    console.log('Shopify webhook received');
    await shopifyToWoo(req.body);  // Pass order payload
    res.status(200).send('Shopify sync triggered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error handling Shopify webhook');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
