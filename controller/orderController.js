const Orders = require('../model/orderModel')
//todo: create order
const createOrder = async (req, res) => {

  const { userId, products, totalAmount } = req.body;
  console.log(req.products, res.userId, res.totalAmount);

  //*validate data
  if (!userId || !products || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the fields.",
    });
  }

  try {
    const order = new Orders({
      userId,
      products,
      totalAmount,
    });
    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
    createOrder
}