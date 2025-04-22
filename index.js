
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


require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const handleWooOrder = require("./woo-to-shopify");
const handleShopifyOrder = require("./shopify-to-woo"); // ✅ Make sure this line matches the file name exactly

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/woo-order-webhook", async (req, res) => {
  console.log("🔥 WooCommerce webhook hit");
  const order = req.body;

  if (!order || !order.id || !order.line_items) {
    console.error("❌ Invalid WooCommerce order payload");
    return res.status(400).send("Invalid payload");
  }

  try {
    await handleWooOrder(order);
    res.status(200).send("✅ WooCommerce order processed");
  } catch (error) {
    console.error("❌ Woo-to-Shopify error:", error);
    res.status(500).send("Error processing WooCommerce order");
  }
});

app.post("/shopify-order-webhook", async (req, res) => {
  console.log("🔥 Shopify webhook hit");
  const order = req.body;

  if (!order || !order.id || !order.line_items) {
    console.error("❌ Invalid or empty Shopify order payload received");
    return res.status(400).send("Invalid payload");
  }

  try {
    await handleShopifyOrder(order); // ✅ This function must be correctly imported above
    res.status(200).send("✅ Shopify order processed");
  } catch (error) {
    console.error("❌ Shopify-to-Woo error:", error);
    res.status(500).send("Error processing Shopify order");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
