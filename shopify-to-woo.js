
// /// ----------------------------------------------------------------------------------------------------------------


// // shopify-to-woo.js
// const axios = require("axios");

// module.exports = async function handleShopifyOrder(order, wooMap) {
//   try {
//     if (!order || !Array.isArray(order.line_items)) return;

//     console.log("📦 Processing Shopify order:", order.id);

//     for (const item of order.line_items) {
//       const shopifyId = String(item.product_id);
//       const mapping   = wooMap.get(shopifyId);
//       if (!mapping) {
//         console.warn(`⚠️ No mapped Woo product for Shopify ID ${shopifyId}`);
//         continue;
//       }

//       const { id: wooId, stock: currentStock } = mapping;
//       const quantity  = item.quantity;
//       const newStock  = Math.max(0, currentStock - quantity);

//       console.log(`🔢 Updating Woo ID ${wooId}: ${currentStock} → ${newStock}`);

//       await axios.put(
//         `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products/${wooId}`,
//         { stock_quantity: newStock },
//         {
//           auth: {
//             username: process.env.WOOCOMMERCE_CONSUMER_KEY,
//             password: process.env.WOOCOMMERCE_CONSUMER_SECRET
//           }
//         }
//       );

//       // Update in-memory map for subsequent calls
//       wooMap.set(shopifyId, { id: wooId, stock: newStock });

//       console.log(`✅ Woo product ${wooId} stock set to ${newStock}`);
//     }
//   } catch (err) {
//     console.error("❌ Shopify-to-Woo error:", err.response?.data || err.message);
//   }
// };

// --------------------------------------------------------------------------------------------------------------


// shopify-to-woo.js
const axios = require("axios");

module.exports = async function handleShopifyOrder(order, wooMap) {
  try {
    if (!order || !Array.isArray(order.line_items)) return;

    console.log("📦 Processing Shopify order:", order.id);

    for (const item of order.line_items) {
      console.log("🧾 Line item:", JSON.stringify(item, null, 2)); // Optional: for debugging

      const shopifyId = String(item.variant_id); // ✅ Using variant_id for accurate mapping
      const mapping   = wooMap.get(shopifyId);

      if (!mapping) {
        console.warn(`⚠️ No mapped Woo product for Shopify variant ID ${shopifyId}`);
        continue;
      }

      const { id: wooId, stock: currentStock } = mapping;
      const quantity  = item.quantity;
      const newStock  = Math.max(0, currentStock - quantity);

      console.log(`🔢 Updating Woo ID ${wooId}: ${currentStock} → ${newStock}`);

      await axios.put(
        `${process.env.WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/products/${wooId}`,
        { stock_quantity: newStock },
        {
          auth: {
            username: process.env.WOOCOMMERCE_CONSUMER_KEY,
            password: process.env.WOOCOMMERCE_CONSUMER_SECRET
          }
        }
      );

      // Update in-memory map for subsequent calls
      wooMap.set(shopifyId, { id: wooId, stock: newStock });

      console.log(`✅ Woo product ${wooId} stock set to ${newStock}`);
    }
  } catch (err) {
    console.error("❌ Shopify-to-Woo error:", err.response?.data || err.message);
  }
};
