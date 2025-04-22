// const express = require("express");
// const bodyParser = require("body-parser");
// const app = express();

// // Import your sync scripts
// const syncWooToShopify = require("./woo-to-shopify");
// const syncShopifyToWoo = require("./shopify-to-woo");

// app.use(bodyParser.json());

// // WooCommerce webhook
// app.post("/webhook/woocommerce", async (req, res) => {
//   console.log("WooCommerce webhook hit");
//   await syncWooToShopify(req.body); // Assuming you export a function in woo-to-shopify.js
//   res.sendStatus(200);
// });

// // Shopify webhook
// app.post("/webhook/shopify", async (req, res) => {
//   console.log("Shopify webhook hit");
//   await syncShopifyToWoo(req.body); // Assuming you export a function in shopify-to-woo.js
//   res.sendStatus(200);
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


//-------------------------------------------------------------------------------------

// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to receive WooCommerce order webhook
app.post('/woo-order-webhook', (req, res) => {
  console.log('🔥 WooCommerce webhook hit');
  console.log('📦 Order Data:', req.body); // Logs the incoming payload
  res.status(200).send('Webhook received');
});

// Optional: default route to verify server is running
app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

// Catch-all route for debugging
app.use((req, res) => {
  console.log('⚠️ Unknown route hit:', req.path);
  res.status(404).send('Not found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
