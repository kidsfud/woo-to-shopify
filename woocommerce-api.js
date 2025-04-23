// const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// const api = new WooCommerceRestApi({
//   url: "https://kidsfud.com", // your WooCommerce store URL
//   consumerKey: "ck_037f389e115a90686f05836a2e0ec13642efcd43", 
//   consumerSecret: "cs_81ae5a9e932b10614b12f310df5945eb37d1ee96", 
//   version: "wc/v3" // use "wc/v3" for current REST API
// });

// module.exports = api;


// --------------------------------------------------------------------------------------


// const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

// const api = new WooCommerceRestApi({
//   url: process.env.WOOCOMMERCE_URL,
//   consumerKey: process.env.WOOCOMMERCE_KEY,
//   consumerSecret: process.env.WOOCOMMERCE_SECRET,
//   version: "wc/v3",
// });

// async function updateWooStockByShopifyProductId(shopifyProductId, newStock) {
//   try {
//     const response = await api.get("products", {
//       per_page: 100,
//     });

//     const products = response.data;

//     const matchingProduct = products.find((product) =>
//       product.meta_data.some(
//         (meta) => meta.key === "shopify_product_id" && meta.value == shopifyProductId
//       )
//     );

//     if (!matchingProduct) {
//       console.error("❌ No matching WooCommerce product found for Shopify product ID:", shopifyProductId);
//       return;
//     }

//     const update = await api.put(`products/${matchingProduct.id}`, {
//       stock_quantity: newStock,
//     });

//     console.log(`✅ WooCommerce stock updated for Product ID ${matchingProduct.id}: ${newStock}`);
//   } catch (err) {
//     console.error("❌ WooCommerce stock update error:", err.response?.data || err.message);
//   }
// }

// module.exports = { updateWooStockByShopifyProductId };


const fetch = require('node-fetch');
require('dotenv').config();

async function updateWooCommerceStock(productId, newStockQty) {
  const response = await fetch(`${process.env.WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stock_quantity: newStockQty,
      manage_stock: true,
    }),
    auth: {
      user: process.env.WC_CONSUMER_KEY,
      pass: process.env.WC_CONSUMER_SECRET,
    },
  });

  const data = await response.json();
  console.log(`WooCommerce stock updated for Product ID ${productId} -> ${newStockQty}`);
  return data;
}

module.exports = { updateWooCommerceStock };
