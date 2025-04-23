
// // index.js
// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Route to receive WooCommerce order webhook
// app.post('/woo-order-webhook', (req, res) => {
//   console.log('🔥 WooCommerce webhook hit');
//   console.log('📦 Order Data:', req.body); // Logs the incoming payload
//   res.status(200).send('Webhook received');
// });

// // Optional: default route to verify server is running
// app.get('/', (req, res) => {
//   res.send('🚀 Server is running!');
// });

// // Catch-all route for debugging
// app.use((req, res) => {
//   console.log('⚠️ Unknown route hit:', req.path);
//   res.status(404).send('Not found');
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`✅ Server listening on port ${PORT}`);
// });

//------------------------------------------------------------------------------------------------------------------------------------------------------------------

// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");

// const wooToShopifyHandler = require("./woo-to-shopify");
// const shopifyToWooHandler = require("./shopify-to-woo");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(bodyParser.json());

// // 🧃 WooCommerce Webhook Handler
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🔥 WooCommerce webhook received");
//   wooToShopifyHandler(req, res);
// });

// // 🛍️ Shopify Webhook Handler
// app.post("/shopify-order-webhook", (req, res) => {
//   console.log("🛒 Shopify webhook received");
//   shopifyToWooHandler(req, res);
// });

// app.get("/", (req, res) => {
//   res.send("✅ Webhook server is running");
// });

// app.listen(port, () => {
//   console.log(`🚀 Server is running at http://localhost:${port}`);
// });



///----------------------------------------------------------------------------------------------------------------------------------


// // index.js
// require("dotenv").config();
// const express = require("express");
// const app = express();
// const port = 3000;

// const handleWooOrder = require("./woo-to-shopify");
// // const handleShopifyOrder = require("./shopify-to-woo");
// const handleShopifyOrder = require("./shopify-to-woo");


// app.use(express.json());

// // WooCommerce order webhook → Shopify stock sync
// app.post("/woo-order-webhook", async (req, res) => {
//   console.log("🔥 WooCommerce webhook hit");
//   try {
//     await handleWooOrder(req.body);
//     res.status(200).send("✅ Woo order processed");
//   } catch (err) {
//     console.error("❌ Woo-to-Shopify error:", err);
//     res.status(500).send("Failed");
//   }
// });

// // Shopify order webhook → WooCommerce stock sync
// app.post("/shopify-order-webhook", async (req, res) => {
//   console.log("🔥 Shopify webhook hit");
//   try {
//     await handleShopifyOrder(req.body);
//     res.status(200).send("✅ Shopify order processed");
//   } catch (err) {
//     console.error("❌ Shopify-to-Woo error:", err);
//     res.status(500).send("Failed");
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Server is running at http://localhost:${port}`);
// });


////-----------------------------------------------------------------------------------------------------
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");

// const handleWooOrder     = require("./woo-to-shopify");
// const handleShopifyOrder = require("./shopify-to-woo");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // parse JSON bodies
// app.use(bodyParser.json());

// // ───────────────────────────────────────────────────────────────
// // Webhook: WooCommerce → Shopify
// // ───────────────────────────────────────────────────────────────
// app.post("/woo-order-webhook", (req, res) => {
//   console.log("🔥 WooCommerce webhook hit");
//   // pass req/res into your handler
//   handleWooOrder(req, res);
// });

// // ───────────────────────────────────────────────────────────────
// // Webhook: Shopify → WooCommerce
// // ───────────────────────────────────────────────────────────────
// app.post("/shopify-order-webhook", (req, res) => {
//   console.log("🔥 Shopify webhook hit");
//   console.log("📥 Raw body:", JSON.stringify(req.body, null, 2));
//   // now req.body will be defined inside your handler
//   handleShopifyOrder(req, res);
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });


/// ------------------------------------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const handleWooOrder     = require("./woo-to-shopify");
const handleShopifyOrder = require("./shopify-to-woo");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// WooCommerce → Shopify
app.post("/woo-order-webhook", (req, res) => {
  console.log("🔥 WooCommerce webhook hit");
  res.sendStatus(200);                // 1) ACK immediately
  handleWooOrder(req.body);           // 2) then process
});

// Shopify → WooCommerce
app.post("/shopify-order-webhook", (req, res) => {
  console.log("🔥 Shopify webhook hit");
  console.log("📥 Raw body:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);                // 1) ACK immediately
  handleShopifyOrder(req.body);       // 2) then process
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
