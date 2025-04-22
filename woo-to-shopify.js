
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   SHOPIFY_LOCATION_ID
// } = process.env;

// app.post("/woo-order-webhook", async (req, res) => {
//   console.log("🔥 Webhook hit");
//   const order = req.body;

//   // ✅ Check for empty or invalid order payload
//   if (!order || Object.keys(order).length === 0 || !order.id) {
//     console.warn("❌ Received empty or undefined body");
//     return res.status(200).send("Ignored empty payload");
//   }

//   if (!order.line_items || !Array.isArray(order.line_items)) {
//     console.log("📨 Full Order Payload:\n", order);
//     console.error("❌ Invalid Order Format");
//     return res.status(400).send("Invalid order format");
//   }

//   console.log("📦 Order ID:", order.id);

//   for (const item of order.line_items) {
//     const quantity = item.quantity;
//     const meta = item.meta_data || [];
//     const shopifyMeta = meta.find(m => m.key === "shopify_product_id");
//     const shopifyProductId = shopifyMeta ? shopifyMeta.value : null;

//     if (!shopifyProductId) {
//       console.warn(`⚠️ No Shopify Product ID found for item: ${item.name}`);
//       continue;
//     }

//     try {
//       // Step 1: Get product variants
//       const variantRes = await axios.get(
//         `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${shopifyProductId}/variants.json`,
//         {
//           headers: {
//             "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
//             "Content-Type": "application/json"
//           }
//         }
//       );

//       const variants = variantRes.data.variants;
//       if (!variants || variants.length === 0) {
//         console.error("❌ No variants found for this product.");
//         continue;
//       }

//       const inventoryItemId = variants[0].inventory_item_id;
//       console.log(`➡️ Updating inventory item ID: ${inventoryItemId} | Quantity: ${quantity}`);

//       // Step 2: Adjust inventory
//       const adjustEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/adjust.json`;
//       const payload = {
//         location_id: SHOPIFY_LOCATION_ID,
//         inventory_item_id: inventoryItemId,
//         available_adjustment: -quantity
//       };

//       await axios.post(adjustEndpoint, payload, {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
//           "Content-Type": "application/json"
//         }
//       });

//       console.log(`✅ Inventory updated for inventory_item_id: ${inventoryItemId}`);
//     } catch (err) {
//       console.error("❌ Error updating Shopify product:", err.response?.data || err.message);
//     }
//   }

//   res.status(200).send("✅ Webhook processed");
// });

// app.listen(port, () => {
//   console.log(`🚀 Server is running at http://localhost:${port}`);
// });



// -----------------------------------------------------------------------------------------------------------------


require("dotenv").config();
const axios = require("axios");

const {
  SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_STORE_URL,
  SHOPIFY_LOCATION_ID
} = process.env;

module.exports = async function handleWooOrderWebhook(req, res) {
  console.log("🔥 WooCommerce Webhook hit");
  const order = req.body;

  if (!order || Object.keys(order).length === 0 || !order.id) {
    console.warn("❌ Received empty or undefined body");
    return res.status(200).send("Ignored empty payload");
  }

  if (!order.line_items || !Array.isArray(order.line_items)) {
    console.log("📨 Full Order Payload:\n", order);
    console.error("❌ Invalid Order Format");
    return res.status(400).send("Invalid order format");
  }

  console.log("📦 Order ID:", order.id);

  for (const item of order.line_items) {
    const quantity = item.quantity;
    const meta = item.meta_data || [];
    const shopifyMeta = meta.find(m => m.key === "shopify_product_id");
    const shopifyProductId = shopifyMeta ? shopifyMeta.value : null;

    if (!shopifyProductId) {
      console.warn(`⚠️ No Shopify Product ID found for item: ${item.name}`);
      continue;
    }

    try {
      // Step 1: Get product variants
      const variantRes = await axios.get(
        `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${shopifyProductId}/variants.json`,
        {
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );

      const variants = variantRes.data.variants;
      if (!variants || variants.length === 0) {
        console.error("❌ No variants found for this product.");
        continue;
      }

      const inventoryItemId = variants[0].inventory_item_id;
      console.log(`➡️ Updating inventory item ID: ${inventoryItemId} | Quantity: ${quantity}`);

      // Step 2: Adjust inventory
      const adjustEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/adjust.json`;
      const payload = {
        location_id: SHOPIFY_LOCATION_ID,
        inventory_item_id: inventoryItemId,
        available_adjustment: -quantity
      };

      await axios.post(adjustEndpoint, payload, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });

      console.log(`✅ Inventory updated for inventory_item_id: ${inventoryItemId}`);
    } catch (err) {
      console.error("❌ Error updating Shopify product:", err.response?.data || err.message);
    }
  }

  res.status(200).send("✅ Webhook processed");
};
