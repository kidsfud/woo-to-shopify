
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


// require("dotenv").config();
// const axios = require("axios");

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   SHOPIFY_LOCATION_ID
// } = process.env;

// module.exports = async function handleWooOrderWebhook(req, res) {
//   console.log("🔥 WooCommerce Webhook hit");
//   const order = req.body;

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
// };

// ------------------------------------------------------------------------------------------------------------------


// // woo-to-shopify.js
// require("dotenv").config();
// const axios = require("axios");

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   SHOPIFY_LOCATION_ID
// } = process.env;

// module.exports = async function handleWooOrderWebhook(order) {
//   if (!order || Object.keys(order).length === 0 || !order.id) {
//     console.warn("❌ Received empty or undefined body");
//     return;
//   }

//   if (!order.line_items || !Array.isArray(order.line_items)) {
//     console.log("📨 Full Order Payload:\n", order);
//     console.error("❌ Invalid Order Format");
//     return;
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
// };

// // ----------------------------------------------------------------------------------------------------------------


// // woo-to-shopify.js
// require("dotenv").config();
// const axios = require("axios");

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   SHOPIFY_LOCATION_ID
// } = process.env;

// module.exports = async function handleWooOrderWebhook(order) {
//   if (!order || Object.keys(order).length === 0 || !order.id) {
//     console.warn("❌ Received empty or undefined body");
//     return;
//   }

//   if (!order.line_items || !Array.isArray(order.line_items)) {
//     console.log("📨 Full Order Payload:\n", order);
//     console.error("❌ Invalid Order Format");
//     return;
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
//       // Step 1: Get product variants to find the inventory_item_id
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

//       // Step 2: Adjust inventory using inventory_item_id and location_id
//       const adjustEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/adjust.json`;
//       const payload = {
//         location_id: SHOPIFY_LOCATION_ID,
//         inventory_item_id: inventoryItemId,
//         available_adjustment: -quantity
//       };

//       // 👇 Debug log before making the request
//       console.log("📦 Payload to Shopify Inventory API:", payload);

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
// };


// -------------------------------------------------------------------------------------------------------------
// woo-to-shopify.js
require("dotenv").config();
const axios = require("axios");

const {
  SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_STORE_URL,
  SHOPIFY_LOCATION_ID
} = process.env;

module.exports = async function handleWooOrderWebhook(order) {
  if (!order || Object.keys(order).length === 0 || !order.id) {
    console.warn("❌ Received empty or undefined body");
    return;
  }

  if (!order.line_items || !Array.isArray(order.line_items)) {
    console.log("📨 Full Order Payload:\n", order);
    console.error("❌ Invalid Order Format");
    return;
  }

  console.log("📦 Order ID:", order.id);

  for (const item of order.line_items) {
    const quantity = item.quantity;
    const meta = item.meta_data || [];
    const shopifyMeta = meta.find(m => m.key === "shopify_product_id");
    const shopifyProductId = shopifyMeta ? String(shopifyMeta.value) : null;

    console.log(`🔍 Shopify Product ID (as string): ${shopifyProductId}`);

    if (!shopifyProductId) {
      console.warn(`⚠️ No Shopify Product ID found for item: ${item.name}`);
      continue;
    }

    try {
      // Step 1: Get variants of the Shopify product
      const variantUrl = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${shopifyProductId}/variants.json`;

      console.log("🔎 Getting variants from:", variantUrl);

      const variantRes = await axios.get(variantUrl, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });

      const variants = variantRes.data.variants;
      if (!variants || variants.length === 0) {
        console.error("❌ No variants found for this product.");
        continue;
      }

      const inventoryItemId = variants[0].inventory_item_id;
      console.log(`➡️ Updating inventory item ID: ${inventoryItemId} | Quantity: ${quantity}`);

      // Step 2: Adjust inventory
      const adjustUrl = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/inventory_levels/adjust.json`;
      const payload = {
        location_id: SHOPIFY_LOCATION_ID,
        inventory_item_id: inventoryItemId,
        available_adjustment: -quantity
      };

      console.log("📤 Sending inventory adjustment to:", adjustUrl);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      await axios.post(adjustUrl, payload, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });

      console.log(`✅ Inventory updated for inventory_item_id: ${inventoryItemId}`);
    } catch (err) {
      console.error("❌ Shopify API error:", err.response?.data || err.message);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------------

// // woo-to-shopify.js
// require("dotenv").config();
// const axios = require("axios");

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   SHOPIFY_LOCATION_ID
// } = process.env;

// module.exports = async function handleWooOrderWebhook(order) {
//   if (!order || !order.id || !Array.isArray(order.line_items)) {
//     console.warn("❌ Invalid order payload");
//     return;
//   }

//   console.log("📦 Order ID:", order.id);

//   for (const item of order.line_items) {
//     const quantity = item.quantity;
//     const shopifyMeta = (item.meta_data || [])
//       .find(m => m.key === "shopify_product_id");
//     const shopifyProductId = shopifyMeta
//       ? String(shopifyMeta.value)
//       : null;

//     if (!shopifyProductId) {
//       console.warn(`⚠️ Missing shopify_product_id for ${item.name}`);
//       continue;
//     }

//     console.log("🔍 Shopify Product ID:", shopifyProductId);

//     try {
//       // 1️⃣ Fetch variants
//       const variantUrl =
//         `https://${SHOPIFY_STORE_URL}` +
//         `/admin/api/2024-01/products/${shopifyProductId}/variants.json`;

//       console.log("🔎 GET", variantUrl);
//       const { data: { variants } } = await axios.get(variantUrl, {
//         headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN }
//       });

//       if (!variants.length) {
//         console.error("❌ No variants for", shopifyProductId);
//         continue;
//       }

//       const inventoryItemId = variants[0].inventory_item_id;
//       console.log("➡️ inventory_item_id:", inventoryItemId, "| Δ:", -quantity);

//       // 2️⃣ Adjust inventory
//       const adjustUrl =
//         `https://${SHOPIFY_STORE_URL}` +
//         `/admin/api/2024-01/inventory_levels/adjust.json`;

//       const payload = {
//         location_id: SHOPIFY_LOCATION_ID,
//         inventory_item_id: inventoryItemId,
//         available_adjustment: -quantity
//       };

//       console.log("📤 POST", adjustUrl);
//       console.log("📦 Payload:", payload);

//       await axios.post(adjustUrl, payload, {
//         headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN }
//       });

//       console.log("✅ Inventory updated");
//     } catch (err) {
//       console.error("❌ Shopify API error:", err.response?.data || err.message);
//     }
//   }
// };
