const { vendorSignupSchema } = require('../middlewares/vendorValidator');
const Vendor = require ('../models/vendorSchema')

exports.vendorSignup = async (req, res) => {
    const {businessName,businessType,businessAddress,bankAccountname,bankAccountnumber,bankName,
        paymentMethodPreferences,businessRegCert,validID,termsandConditionsAgreement} = req.body;

    try {
        const{error, value} = vendorSignupSchema.validate({businessName,businessType,businessAddress,bankAccountname,bankAccountnumber,bankName,
            paymentMethodPreferences,businessRegCert,validID,termsandConditionsAgreement})

        if(error){
            return res.status(401).json({success:false, message: error.details[0].message})
            } 
        const existingVendor = Vendor.findone({businessName})
        if(existingVendor){
            return res.status(401).json({sucess:false, message:"Vendor already exists"})
        }
        const newVendor = new Vendor ({
            businessName,
            businessType: req.body.businessType,
            businessAddress: req.body.businessAddress,
            bankAccountname: req.body.bankAccountname,
            bankAccountnumber: req.body.bankAccountnumber,
            bankName: req.body.bankName,
            paymentMethodPreferences: req.body.paymentMethodPreferences,
            businessRegCert: req.body.businessRegCert,
            validID: req.body.validID,
            termsandConditionsAgreement: req.body.termsandConditionsAgreement
        })
        const result = await newVendor.save();

        res.status(201).json({success: true, message: "Your EASYSHIP NG vendor account has been created successfully",
        result
})


} catch (error) {
    console.log (error)
}
}
