const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { updateWooStockByShopifyProductId } = require('./woocommerce-api');

// Middleware to verify Shopify HMAC
function verifyShopifyWebhook(req, res, buf, encoding) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const generatedHmac = crypto
    .createHmac('sha256', secret)
    .update(buf, encoding)
    .digest('base64');

  if (generatedHmac !== hmacHeader) {
    throw new Error('HMAC verification failed');
  }
}

// Use raw body parser with verify function
router.use(
  express.json({
    verify: verifyShopifyWebhook,
  })
);

// Shopify sends inventory updates via `inventory_levels/update`
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const { inventory_item_id, available } = payload;

    console.log('Received Shopify inventory webhook:', payload);

    // Update WooCommerce stock by matching Shopify inventory item
    await updateWooStockByShopifyProductId(String(inventory_item_id), available);

    res.sendStatus(200);
  } catch (error) {
    console.error('Shopify webhook error:', error);
    res.sendStatus(401);
  }
});

module.exports = router;
