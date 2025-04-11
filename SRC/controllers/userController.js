const jwt = require('jsonwebtoken');
const User = require('../models/userSchema')
const {userSignupSchema, userSigninSchema} = require('../middlewares/userValidator')
const {hashUser, doHashValidation} = require('../utils/userHashing')

exports.userSignup = async (req, res) => {
    const {email, password, name, phone, address} = req.body;

    try {
        const {error, value} = userSignupSchema.validate ({email, password,name,address,phone});
        if (error) 
            {return res.status(401).json({success:false, message: error.details[0].message});

    }
    const existingUser = await User.findOne({email})
    if (existingUser){
        return res.status(409).json({success:false, message: "Email already exists"});
    }
    const hashedPassword = await hashUser(password, 12)
    const newUser = new User ({
        email,
        password: hashedPassword,
        phone: req.body.phone,
        address: req.body.address,
        name: req.body.name
    })
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({success: true, message: "Your EASYSHIP NG account has been created successfully", result, 
    });
    } catch (error) {
        console.log(error)
    }
}

exports.userSignin = async (req, res) => {
    const { email, phone, password } = req.body;

    try {
        const { error, value } = userSigninSchema.validate({ email, phone, password });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        let existingUser;
        if (email) {
            existingUser = await User.findOne({ email }).select("+password");
        } else if (phone) {
            existingUser = await User.findOne({ phone }).select("+password");
        }

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        const result = await doHashValidation(password, existingUser.password)
       if(!result){
        return res.status(401).json({success: false, message: 'Invalid password.'});
       }
       const token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email || null,
            phone: existingUser.phone || null,
            verified: existingUser.verified,
        }, process.env.TOKEN_SECRET);

        res.cookie('Authorization', 'Bearer' + token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: process.env.NODE_ENV === 'production', 
            secure: process.env.NODE_ENV === 'production'}).json({
                success: true,
                token,
                message: 'Logged in successfuly'
            });
    } catch(error){
        console.log(error);
    }
}

exports.userSignout = async (req, res)=>{
    res.clearCookie('Authorization')
    res.status(200).json({success:true, message: 'User logged out Successfully'})
}