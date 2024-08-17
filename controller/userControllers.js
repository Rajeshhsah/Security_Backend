const Users = require("../model/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//*! Register logic
const createUser = async (req, res) => {
    //* Step 1: Check if data is coming or not
    console.log(req.body);

    //* Step 2: Destructure the data
    const { firstName, lastName, email, password } = req.body;

    //* Step 3: Validate the incoming data
    if (!firstName || !lastName || !email || !password) {
        return res.json({
            success: false,
            message: "Please enter all fields",
        });
    }

    //* Step 4: Try-catch block
    try {
        //* Step 5: Check existing user
        const existingUser = await Users.findOne({ email: email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists.",
            });
        }

        //* Password encryption
        const randomSalt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, randomSalt);

        //* Step 6: Create new user
        const newUser = new Users({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: encryptedPassword,
        });

        await newUser.save();
        res.json({
            success: true,
            message: "User created successfully.",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

//* Login logic
const loginUser = async (req, res) => {
    //* Step 1: Check incoming data
    console.log(req.body);

    //* Destructuring
    const { email, password } = req.body;

    //* Validation
    if (!email || !password) {
        return res.json({
            success: false,
            message: "Please enter all fields",
        });
    }

    //* Try-catch block
    try {
        //* Finding user
        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "User does not exist.",
            });
        }

        //* Login attempt tracking and lockout mechanism
        const maxFailedAttempts = 3;
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

        // Check if the user is currently locked out
        if (user.failedLoginAttempts >= maxFailedAttempts) {
            const now = new Date();
            const timeSinceLastAttempt = now - new Date(user.lastFailedLogin);
            const timeLeft = lockoutDuration - timeSinceLastAttempt;

            if (timeSinceLastAttempt < lockoutDuration) {
                const minutesLeft = Math.ceil(timeLeft / (60 * 1000));

                return res.json({
                    success: false,
                    message: `Too many failed attempts. Your account is locked. Please try again in ${minutesLeft} minute(s).`,
                    attemptsLeft: 0,
                    timeLeft: minutesLeft,
                });
            }

            // Reset failed attempts and timestamp after lockout period
            user.failedLoginAttempts = 0;
            user.lastFailedLogin = null;
            await user.save();
        }

        //* Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.failedLoginAttempts += 1;
            user.lastFailedLogin = new Date();
            await user.save();

            const attemptsLeft = maxFailedAttempts - user.failedLoginAttempts;

            return res.json({
                success: false,
                message: `Password doesn't match. You have ${attemptsLeft} attempt(s) left.`,
                attemptsLeft: attemptsLeft,
                timeLeft: null,
            });
        }

        //* Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.lastFailedLogin = null;
        await user.save();

        //* Create token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        //* Response
        res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            token: token,
            userData: user,
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Server Error",
        });
    }
};

//* Change Password logic
const changePassword = async (req, res) => {
    try {
        console.log(req.body);
        const { oldPassword, newPassword, userId } = req.body;

        //* Find user by ID
        const user = await Users.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        //* Check if old password matches
        const isMatched = await bcrypt.compare(oldPassword, user.password);

        if (!isMatched) {
            return res.json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        //* Ensure new password is secure
        if (newPassword.length < 8) {
            return res.json({
                success: false,
                message: "New password must be at least 8 characters long",
            });
        }

        //* Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

//* Update User Profile logic
const updateUserProfile = async (req, res) => {
    const userId = req.params.userId;
    const { firstName, lastName, email } = req.body; 
    const { profileImage } = req.files;

    try {
        // Upload image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(
            profileImage.path,
            {
                folder: 'users',
                crop: 'scale'
            }
        );

        // Find the user by ID
        let user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user data fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.profileImage = result.secure_url;

        // Save the updated user data
        user = await user.save();

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createUser,
    loginUser,
    changePassword,
    updateUserProfile,
};
