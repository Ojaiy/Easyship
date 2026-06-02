const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const { userSignupSchema, userSigninSchema } = require('../middlewares/userValidator');
const { hashUser, doHashValidation } = require('../utils/userHashing');


exports.userSignup = async (req, res) => {
    const { email, password, name, phone } = req.body;

    try {
        const { error } = userSignupSchema.validate({
            email,
            password,
            name,
            phone
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await hashUser(password, 12);

        const newUser = new User({
            email,
            password: hashedPassword,
            phone,
            name
        });

        const result = await newUser.save();

        const token = jwt.sign(
            {
                userId: result._id,
                email: result.email
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: '1d'
            }
        );

        result.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Your EASYSHIP NG account has been created successfully",
            token,
            user: {
                _id: result._id,
                name: result.name,
                email: result.email,
                phone: result.phone
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.userSignin = async (req, res) => {
    const { email, phone, password } = req.body;

    try {
        const { error } = userSigninSchema.validate({ email, phone, password });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

      let existingUser;

const allUsers = await User.find({}, "email");

if (email) {
    existingUser = await User.findOne({ email }).select("+password");
} else if (phone) {
    existingUser = await User.findOne({ phone }).select("+password");
}

        const isPasswordValid = await doHashValidation(password, existingUser.password);

      try {
    
    const isPasswordValid = await doHashValidation(
        password,
        existingUser.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid password"
        });
    }

} catch (err) {
    console.error("PASSWORD CHECK ERROR:", err);

    return res.status(500).json({
        success: false,
        message: err.message
    });
}


        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email || null,
                phone: existingUser.phone || null,
                verified: existingUser.verified
            },
            process.env.TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                phone: existingUser.phone,
                verified: existingUser.verified
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.userSignout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};