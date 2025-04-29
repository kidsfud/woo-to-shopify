
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
      console.log('No matching WooCommerce product found for Shopify inventory  item:', inventoryItemId);
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
