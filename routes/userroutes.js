

// import router from express
const router = require("express").Router();
const userController = require("../controller/userControllers");
// const userController = require ("../controller/userControllers");

//all the routes for the user
router.post("/create", userController.createUser);

router.post("/login", userController.loginUser);

router.post("/changepassword", userController.changePassword);

router.put('/update_profile/:userId', userController.updateUserProfile);

//export
module.exports = router;