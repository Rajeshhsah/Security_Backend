// importing
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary');
const acceptMultimedia = require('connect-multiparty')

// Making express app
const app = express();

// dotenv config
dotenv.config();

// cloudinary config

          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(acceptMultimedia())

// cors config to accept request from frontend
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions))

// mongodb connection
connectDB();

// Accepting json data
app.use(express.json());

// creating test route
app.get("/test", (req,res) => {
    res.status(200).json("Hello from server");
})

// user routes
app.use('/api/user', require('./routes/userroutes'))
// our actual routes
// http://localhost:5000/api/user/create
// http://localhost:5000/api/user/login

// CREATE A ROUTE FOR PRODUCTS
app.use("/api/product", require("./routes/productRoutes"))




app.use("/api/cart", require("./routes/addtocartRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
// defining port
const PORT = process.env.PORT;
// run the server
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})


// make a POST route in userRoutes.js
// make a function for login and export it
// test in postman