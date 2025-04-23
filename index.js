// /// -----------------------------------------------------------------------------------

// require("dotenv").config();
// const express    = require("express");
// const bodyParser = require("body-parser");
// const axios      = require("axios");

// const handleWooOrder     = require("./woo-to-shopify");
// const handleShopifyOrder = require("./shopify-to-woo");

// const app  = express();
// const PORT = process.env.PORT || 3000;

// // parse JSON bodies
// app.use(bodyParser.json());

// // ──────────────────────────────────────────────────────────────────
// // 1️⃣ Preload WooCommerce→Shopify mapping into memory
// // ──────────────────────────────────────────────────────────────────
// const wooProductMap = new Map();  // shopify_product_id → { id, stock }

// async function loadWooMap() {
//   let page = 1;
//   while (true) {
//     const { data: products } = await axios.get(
//       `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products`,
//       {
//         params: {
//           consumer_key:    process.env.WOOCOMMERCE_CONSUMER_KEY,
//           consumer_secret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
//           per_page:        100,
//           page,
//           context:         "edit"
//         }
//       }
//     );
//     if (!Array.isArray(products) || products.length === 0) break;

//     for (const prod of products) {
//       if (!Array.isArray(prod.meta_data)) continue;
//       const entry = prod.meta_data.find(m => m.key === "shopify_product_id");
//       if (entry) {
//         wooProductMap.set(String(entry.value), {
//           id:    prod.id,
//           stock: parseInt(prod.stock_quantity, 10) || 0
//         });
//       }
//     }
//     page++;
//   }
//   console.log(`✅ Loaded ${wooProductMap.size} products into Woo→Shopify map`);
// }

// // Start the server only after loading the map
// loadWooMap().then(() => {
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// });

// // ───────────────────────────────────────────────────────────────
// // 2️⃣ Webhook: WooCommerce → Shopify
// // ───────────────────────────────────────────────────────────────
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🔥 WooCommerce webhook hit");
//   res.sendStatus(200);                    // ACK immediately
//   handleWooOrder(req.body, wooProductMap);
// });

// // ───────────────────────────────────────────────────────────────
// // 3️⃣ Webhook: Shopify → WooCommerce
// // ───────────────────────────────────────────────────────────────
// app.post("/shopify-order-webhook", (req, res) => {
//   console.log("🔥 Shopify webhook hit");
//   res.sendStatus(200);                    // ACK immediately
//   handleShopifyOrder(req.body, wooProductMap);
// });

// --------------------------------------------------------------------------------------


// index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const handleWooOrder = require("./woo-to-shopify");
const handleShopifyOrder = require("./shopify-to-woo");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook: WooCommerce → Shopify
app.post("/woo-order-webhook", (req, res) => {
  console.log("🔥 WooCommerce webhook hit");
  res.sendStatus(200); // Immediately acknowledge
  handleWooOrder(req.body); // Handle order logic separately
});

// Webhook: Shopify → WooCommerce
app.post("/shopify-order-webhook", (req, res) => {
  console.log("🔥 Shopify webhook hit");
  console.log("📅 Raw body:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
  handleShopifyOrder(req.body);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
