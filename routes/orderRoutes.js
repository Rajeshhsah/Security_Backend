const router = require('express').Router();
const orderController = require('../controller/orderController')

//* create order
router.post("/addToOrder", orderController.createOrder)

module.exports = router;
