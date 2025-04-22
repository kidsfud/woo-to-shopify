// require("dotenv").config();
// const axios = require("axios");

// const {
//   SHOPIFY_ACCESS_TOKEN,
//   SHOPIFY_STORE_URL,
//   WOOCOMMERCE_SITE_URL,
//   WOOCOMMERCE_CONSUMER_KEY,
//   WOOCOMMERCE_CONSUMER_SECRET
// } = process.env;

// // Function to sync stock
// async function syncShopifyToWoo(shopifyProductId) {
//   try {
//     // 1. Get Shopify product variants
//     const variantRes = await axios.get(
//       `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${shopifyProductId}/variants.json`,
//       {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN
//         }
//       }
//     );

//     const variants = variantRes.data.variants;
//     if (!variants || variants.length === 0) {
//       console.log("❌ No variants found in Shopify product");
//       return;
//     }

//     const variant = variants[0];
//     const inventoryQty = variant.inventory_quantity;
//     console.log(`📦 Shopify Product ID: ${shopifyProductId} | Quantity: ${inventoryQty}`);

//     // 2. Get all WooCommerce products and match by meta key `shopify_product_id`
//     const wooRes = await axios.get(
//       `${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products?per_page=100&consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}`
//     );

//     const products = wooRes.data;
//     let matchingProduct = null;

//     for (const product of products) {
//       const metaRes = await axios.get(
//         `${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products/${product.id}/meta?consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}`
//       );

//       const meta = metaRes.data;
//       const found = meta.find(m => m.key === "shopify_product_id" && m.value == shopifyProductId);

//       if (found) {
//         matchingProduct = product;
//         break;
//       }
//     }

//     if (!matchingProduct) {
//       console.log("❌ No matching WooCommerce product found");
//       return;
//     }

//     console.log(`🔁 Updating WooCommerce Product ID: ${matchingProduct.id}`);

//     // 3. Update WooCommerce product stock
//     await axios.put(
//       `${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products/${matchingProduct.id}?consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}`,
//       {
//         stock_quantity: inventoryQty,
//         manage_stock: true
//       }
//     );

//     console.log(`✅ WooCommerce stock updated for Product ID: ${matchingProduct.id}`);
//   } catch (error) {
//     console.error("❌ Error syncing from Shopify to Woo:", error.response?.data || error.message);
//   }
// }

// // Example: Call with a Shopify Product ID
// syncShopifyToWoo("9871071674650");


///----------------------------------------------------------------------------------------------------------------------


// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const wooApi = require("./woocommerce-api");

// const app = express();
// const port = 3001;

// const { SHOPIFY_ACCESS_TOKEN, SHOPIFY_STORE_URL } = process.env;

// app.use(bodyParser.json());

// app.post("/shopify-to-woo", async (req, res) => {
//   const { shopify_product_id } = req.body;

//   if (!shopify_product_id) {
//     return res.status(400).send("Missing shopify_product_id");
//   }

//   try {
//     // 1. Get Shopify Product Details
//     const productRes = await axios.get(
//       `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${shopify_product_id}.json`,
//       {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
//         },
//       }
//     );

//     const shopifyProduct = productRes.data.product;
//     const variant = shopifyProduct.variants[0];
//     const shopifyInventory = variant.inventory_quantity;
//     const productTitle = shopifyProduct.title;

//     console.log(`🔄 Shopify ${productTitle} has ${shopifyInventory} in stock`);

//     // 2. Find WooCommerce Product (by name for now)
//     const wooRes = await wooApi.get("products", {
//       search: productTitle,
//     });

//     const wooProduct = wooRes.data.find(p => p.name.toLowerCase() === productTitle.toLowerCase());

//     if (!wooProduct) {
//       return res.status(404).send("WooCommerce product not found");
//     }

//     const wooProductId = wooProduct.id;

//     // 3. Update WooCommerce Stock
//     await wooApi.put(`products/${wooProductId}`, {
//       stock_quantity: shopifyInventory,
//       manage_stock: true,
//     });

//     console.log(`✅ Synced WooCommerce stock for "${productTitle}" → ${shopifyInventory}`);

//     res.send("Stock synced");
//   } catch (err) {
//     console.error("❌ Error syncing stock:", err.response?.data || err.message);
//     res.status(500).send("Error syncing stock");
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Shopify to Woo sync running at http://localhost:${port}`);
// });



// --------------------------------------------------------------------------------------------------


// shopify-to-woo.js

const axios = require("axios");
const woo = require("./woocommerce-api");

async function handleShopifyOrder(order) {
  console.log("📦 Processing Shopify order:", order.id);

  for (const item of order.line_items) {
    const shopifyProductId = item.product_id;
    const quantity = item.quantity;

    console.log(`🔍 Searching WooCommerce product with Shopify ID: ${shopifyProductId}`);

    try {
      // 1. Search products in WooCommerce by custom field
      const response = await woo.get("products", {
        per_page: 100, // adjust if needed
      });

      const matchingProduct = response.data.find(product => {
        const meta = product.meta_data || [];
        const match = meta.find(m => m.key === "shopify_product_id" && m.value == shopifyProductId);
        return !!match;
      });

      if (!matchingProduct) {
        console.warn(`❌ WooCommerce product not found for Shopify ID: ${shopifyProductId}`);
        continue;
      }

      const currentStock = matchingProduct.stock_quantity || 0;
      const newStock = currentStock - quantity;
      const productId = matchingProduct.id;

      console.log(`🛠 Updating stock for Woo Product ID: ${productId} from ${currentStock} to ${newStock}`);

      await woo.put(`products/${productId}`, {
        stock_quantity: newStock
      });

      console.log(`✅ Stock updated for WooCommerce product ID: ${productId}`);
    } catch (err) {
      console.error("❌ Error syncing product to WooCommerce:", err.response?.data || err.message);
    }
  }
}

module.exports = handleShopifyOrder;
