const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  url: "https://kidsfud.com", // your WooCommerce store URL
  consumerKey: "ck_037f389e115a90686f05836a2e0ec13642efcd43", 
  consumerSecret: "cs_81ae5a9e932b10614b12f310df5945eb37d1ee96", 
  version: "wc/v3" // use "wc/v3" for current REST API
});

module.exports = api;
