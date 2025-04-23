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

const express = require('express');
const crypto = require('crypto');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const router = express.Router();

// WooCommerce API setup
const wooApi = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
});

router.post('/shopify-inventory-update-webhook', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.toString('utf8'));
    
    const inventoryItemId = payload.inventory_item_id;
    const available = payload.available;

    console.log("Received Inventory Update from Shopify:", inventoryItemId, available);

    // Now, find the WooCommerce product with matching Shopify ID
    const { data } = await wooApi.get('products', {
      per_page: 100
    });

    const matchingProduct = data.find(
      product => product.meta_data?.find(
        meta => meta.key === 'shopify_product_id' && meta.value == inventoryItemId
      )
    );

    if (!matchingProduct) {
      console.log('No matching WooCommerce product found for Shopify inventory item:', inventoryItemId);
      return res.status(404).send('Product not found');
    }

    // Update WooCommerce stock
    await wooApi.put(`products/${matchingProduct.id}`, {
      stock_quantity: available,
      manage_stock: true
    });

    console.log(`WooCommerce stock updated for product ${matchingProduct.id} to ${available}`);
    res.status(200).send('Inventory synced');
  } catch (error) {
    console.error("Error syncing inventory:", error.message);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
