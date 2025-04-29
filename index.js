// /// -----------------------------------------------------------------------------------

require("dotenv").config();
const express    = require("express");
const bodyParser = require("body-parser");
const axios      = require("axios");

const handleWooOrder     = require("./woo-to-shopify");
const handleShopifyOrder = require("./shopify-to-woo");

const app  = express();
const PORT = process.env.PORT || 3000;

// parse JSON bodies
app.use(bodyParser.json());

// ──────────────────────────────────────────────────────────────────
// 1️⃣ Preload WooCommerce→Shopify mapping into memory
// ──────────────────────────────────────────────────────────────────
const wooProductMap = new Map();  // shopify_product_id → { id, stock }

async function loadWooMap() {
  let page = 1;
  while (true) {
    const { data: products } = await axios.get(
      `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products`,
      {
        params: {
          consumer_key:    process.env.WOOCOMMERCE_CONSUMER_KEY,
          consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
          per_page:        100,
          page,
          context:         "edit"
        }
      }
    );
    if (!Array.isArray(products) || products.length === 0) break;

    for (const prod of products) {
      if (!Array.isArray(prod.meta_data)) continue;
      const entry = prod.meta_data.find(m => m.key === "shopify_product_id");
      if (entry) {
        wooProductMap.set(String(entry.value), {
          id:    prod.id,
          stock: parseInt(prod.stock_quantity, 10) || 0
        });
      }
    }
    page++;
  }
  console.log(`✅ Loaded ${wooProductMap.size} products into Woo→Shopify  map`);
}

// Start the server only after loading the map
loadWooMap().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

// ───────────────────────────────────────────────────────────────
// 2️⃣ Webhook: WooCommerce → Shopify
// ───────────────────────────────────────────────────────────────
app.post("/woo-order-webhook", (req, res) => {
  console.log("🔥 WooCommerce webhook hit");
  res.sendStatus(200);                    // ACK immediately
  handleWooOrder(req.body, wooProductMap);
});

// // ───────────────────────────────────────────────────────────────
// // 3️⃣ Webhook: Shopify → WooCommerce
// // ───────────────────────────────────────────────────────────────
// app.post("/shopify-order-webhook", (req, res) => {
//   console.log("🔥 Shopify webhook hit");
//   res.sendStatus(200);                    // ACK immediately
//   handleShopifyOrder(req.body, wooProductMap);
// });

// ----------------------THE ABOVE WORKED WELL WITH THE ORDER TYPE SYNC----------------------------------------------------------------

// const express = require('express');
// const dotenv = require('dotenv');
// const shopifyInventoryUpdate = require('./shopify-inventory-update');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Attach Shopify inventory webhook route
// app.use('/shopify-inventory-update-webhook', shopifyInventoryUpdate);

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// ----------------------------------------------------------------

// const express = require('express');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const shopifyInventoryUpdate = require('./shopify-inventory-update');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Attach raw body parser BEFORE JSON middleware
// app.use(
//   '/shopify-inventory-update-webhook',
//   bodyParser.raw({ type: 'application/json' }),
//   shopifyInventoryUpdate
// );

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


///------------------------------------------------------------------------------

// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = process.env.PORT || 3000;

// // Skip HMAC, use raw body only for this route
// const shopifyInventoryUpdate = require('./shopify-inventory-update');

// app.use(
//   '/shopify-inventory-update-webhook',
//   bodyParser.raw({ type: 'application/json' }),
//   shopifyInventoryUpdate
// );

// // Add this to keep server running
// app.get('/', (req, res) => {
//   res.send('Server is up and running!');
// });

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });
