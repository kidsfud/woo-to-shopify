// const express = require('express');
// const crypto = require('crypto');
// const router = express.Router();
// const { updateWooStockByShopifyProductId } = require('./woocommerce-api');

// // Middleware to verify Shopify HMAC
// function verifyShopifyWebhook(req, res, buf, encoding) {
//   const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
//   const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
//   const generatedHmac = crypto
//     .createHmac('sha256', secret)
//     .update(buf, encoding)
//     .digest('base64');

//   if (generatedHmac !== hmacHeader) {
//     throw new Error('HMAC verification failed');
//   }
// }

// // Use raw body parser with verify function
// router.use(
//   express.json({
//     verify: verifyShopifyWebhook,
//   })
// );

// // Shopify sends inventory updates via `inventory_levels/update`
// router.post('/', async (req, res) => {
//   try {
//     const payload = req.body;
//     const { inventory_item_id, available } = payload;

//     console.log('Received Shopify inventory webhook:', payload);

//     // Update WooCommerce stock by matching Shopify inventory item
//     await updateWooStockByShopifyProductId(String(inventory_item_id), available);

//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Shopify webhook error:', error);
//     res.sendStatus(401);
//   }
// });

// module.exports = router;


// --------------------------------------------------------------


// const express = require('express');
// const crypto = require('crypto');
// const router = express.Router();
// const { updateWooStockByShopifyProductId } = require('./woocommerce-api');

// router.post('/', async (req, res) => {
//   console.log('✅ Webhook HIT received from Shopify');
//   const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
//   const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
//   const rawBody = req.body;

//   // Calculate HMAC
//   const generatedHmac = crypto
//     .createHmac('sha256', secret)
//     .update(rawBody, 'utf8')
//     .digest('base64');

//   if (generatedHmac !== hmacHeader) {
//     console.error('HMAC verification failed');
//     return res.sendStatus(401);
//   }

//   try {
//     const payload = JSON.parse(rawBody.toString('utf8'));
//     console.log('🔍 Webhook Payload:', payload);

//     const { inventory_item_id, available } = payload;

//     console.log('Verified webhook:', payload);

//     await updateWooStockByShopifyProductId(String(inventory_item_id), available);

//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Webhook processing error:', error);
//     res.sendStatus(500);
//   }
// });

// module.exports = router;

//---------------------------------------------------------------------------------------------------------

// const express = require('express');
// const crypto = require('crypto');
// const fetch = require('node-fetch');
// const { updateWooStockByShopifyProductId } = require('./woocommerce-api');

// const router = express.Router();

// router.post('/', async (req, res) => {
//   console.log('✅ Webhook HIT received from Shopify');

//   const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
//   const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
//   const rawBody = req.body;

//   const generatedHmac = crypto
//     .createHmac('sha256', secret)
//     .update(rawBody, 'utf8')
//     .digest('base64');

//   if (generatedHmac !== hmacHeader) {
//     console.error('❌ HMAC verification failed');
//     return res.sendStatus(401);
//   }

//   try {
//     const payload = JSON.parse(rawBody.toString('utf8'));
//     const { inventory_item_id, available } = payload;

//     console.log('🔍 Shopify Inventory Payload:', payload);

//     // Fetch variant ID using inventory item ID
//     const variantId = await getVariantIdFromInventoryItemId(inventory_item_id);
//     if (!variantId) {
//       console.error('❌ Could not find variant ID from inventory item ID');
//       return res.sendStatus(400);
//     }

//     // Use variant ID to update WooCommerce stock
//     await updateWooStockByShopifyProductId(String(variantId), available);

//     res.sendStatus(200);
//   } catch (error) {
//     console.error('❌ Webhook processing error:', error);
//     res.sendStatus(500);
//   }
// });

// async function getVariantIdFromInventoryItemId(inventoryItemId) {
//   const response = await fetch(
//     `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/inventory_items/${inventoryItemId}.json`,
//     {
//       headers: {
//         'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
//         'Content-Type': 'application/json',
//       },
//     }
//   );

//   const result = await response.json();
//   const inventoryItem = result.inventory_item;

//   if (inventoryItem && inventoryItem.sku) {
//     console.log(`🧩 Fetched SKU from inventory item: ${inventoryItem.sku}`);
//     return inventoryItem.sku; // assuming you've used SKU as shopify_product_id in Woo
//   }

//   return null;
// }

// module.exports = router;


//-------------------------------------------------------------------------------------------------------



const crypto = require('crypto');
const fetch = require('node-fetch'); // Make sure this is installed!
require('dotenv').config();
const { updateWooCommerceStock } = require('./woocommerce-api'); // You should already have this

// HMAC verification
function verifyShopifyWebhook(req) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const generatedHash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(req.body, 'utf8')
    .digest('base64');

  return generatedHash === hmacHeader;
}

const shopifyInventoryUpdate = async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
    console.error('HMAC verification failed');
    return res.status(401).send('Unauthorized');
  }

  try {
    const payload = JSON.parse(req.body.toString('utf8'));

    const inventoryItemId = payload.inventory_item_id;
    const available = payload.available;

    console.log(`Inventory Update: Item ID ${inventoryItemId} now has quantity ${available}`);

    // Now we find the matching WooCommerce product using shopify_product_id custom field
    const response = await fetch(`${process.env.WOOCOMMERCE_API_URL}/wp-json/wc/v3/products?meta_key=shopify_product_id&meta_value=${inventoryItemId}&consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}`);

    const products = await response.json();
    if (!products.length) {
      console.warn('No matching WooCommerce product found');
      return res.status(200).send('No match');
    }

    const wooProductId = products[0].id;

    // Update stock in WooCommerce
    await updateWooCommerceStock(wooProductId, available);

    res.status(200).send('Inventory synced');
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).send('Server error');
  }
};

module.exports = shopifyInventoryUpdate;
