const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Import your sync scripts
const syncWooToShopify = require("./woo-to-shopify");
const syncShopifyToWoo = require("./shopify-to-woo");

app.use(bodyParser.json());

// WooCommerce webhook
app.post("/webhook/woocommerce", async (req, res) => {
  console.log("WooCommerce webhook hit");
  await syncWooToShopify(req.body); // Assuming you export a function in woo-to-shopify.js
  res.sendStatus(200);
});

// Shopify webhook
app.post("/webhook/shopify", async (req, res) => {
  console.log("Shopify webhook hit");
  await syncShopifyToWoo(req.body); // Assuming you export a function in shopify-to-woo.js
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
