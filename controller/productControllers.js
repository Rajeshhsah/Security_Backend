const cloudinary = require("cloudinary");
const Products = require("../model/productModel")

const createProduct = async (req,res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // step 2 : Destructuring data
    const {
        productName, 
        productPrice,
        productDescription,
        productCategory,
    } = req.body;
    const {productImage} = req.files;

    // step 3 : Validate data
    if(!productName || !productPrice || !productDescription || !productCategory || !productImage){
        return res.json({
            success : false,
            message : "Please fill all the fields"
        })
    }

    try {
        // upload image to cloudinary
        const uploadedImage = await cloudinary.v2.uploader.upload(
            productImage.path,
            {
                folder : "products",
                crop : "scale"
            }
        )

        // Save to database
        const newProduct = new Products({
            productName : productName,
            productPrice : productPrice,
            productDescription : productDescription,
            productCategory : productCategory,
            productImageUrl : uploadedImage.secure_url
        })
        await newProduct.save();
        res.json({
            success : true,
            message : "Product created successfully",
            product : newProduct
        })


        
    } catch (error) {
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }

}


// get all products
const getProducts = async (req,res) => {
    try {
        const allProducts = await Products.find({});
        res.json({
            success : true,
            message : "All products fetched successfully!",
            products : allProducts
        })
        
    } catch (error) {
        console.log(error);
        res.send("Internal server error")
    }

}

// fetch single product
const getSingleProduct = async (req,res) => {
    const productId = req.params.id;
    try {
        const singleProduct = await Products.findById(productId);
        res.json({
            success : true,
            message : "Single product fetched successfully!",
            product : singleProduct
        })
        
    } catch (error) {
        console.log(error);
        res.send("Internal server error")
    }
}

// update product
const updateProduct = async (req,res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // destructuring data
    const {
        productName,
        productPrice,
        productDescription,
        productCategory
    } = req.body;
    const {productImage} = req.files;

    // validate data
    if( !productName 
        || !productPrice 
        || !productDescription 
        || !productCategory){
        return res.json({
            success : false,
            message : "Required fields are missing!"
        })
    }

    try {
        // case 1 : if there is image
        if(productImage){
            // upload image to cloudinary
            const uploadedImage = await cloudinary.v2.uploader.upload(
                productImage.path,
                {
                    folder : "products",
                    crop : "scale"
                }
            )

            // make updated json data
            const updatedData = {
                productName : productName,
                productPrice : productPrice,
                productDescription : productDescription,
                productCategory : productCategory,
                productImageUrl : uploadedImage.secure_url
            }

            // find product and update
            const productId = req.params.id;
            await Products.findByIdAndUpdate(productId, updatedData)
            res.json({
                success : true,
                message : "Product updated successfully with Image!",
                updatedProduct : updatedData
            })

        } else {
            // update without image
            const updatedData = {
                productName : productName,
                productPrice : productPrice,
                productDescription : productDescription,
                productCategory : productCategory,
            }

            // find product and update
            const productId = req.params.id;
            await Products.findByIdAndUpdate(productId, updatedData)
            res.json({
                success : true,
                message : "Product updated successfully without Image!",
                updatedProduct : updatedData
            })
        }
        
    } catch (error) {
        res.status(500).json({  
            success : false,
            message : "Internal server error"
        })
    }
}

// delete product
const deleteProduct = async (req,res) =>{
    const productId = req.params.id;

    try {
        await Products.findByIdAndDelete(productId);
        res.json({
            success : true,
            message : "Product deleted successfully!"
        })
        
    } catch (error) {
        res.json({
            success : false,
            message : "Server error!!"
        })
    }
}


const getProductsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        const products = await Products.find({ productCategory: category });
        res.json({
            success: true,
            message: `Products in category "${category}" fetched successfully!`,
            products: products
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const searchProducts = async (req, res) => {
    try {
      const { query } = req.query;
  
      // Perform a case-insensitive search for products containing the query in their name or description
      const products = await Products.find({
        $or: [
          { productName: { $regex: query, $options: 'i' } },
          { productDescription: { $regex: query, $options: 'i' } }
        ]
      });
  
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


module.exports = {
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts
}