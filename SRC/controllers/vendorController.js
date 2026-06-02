const { vendorSignupSchema } = require("../middlewares/vendorValidator");
const Vendor = require("../models/vendorSchema");

exports.vendorSignup = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      businessAddress,
      bankAccountname,
      bankAccountnumber,
      bankName,
      paymentMethodPreferences,
      businessRegCert,
      validID,
      termsandConditionsAgreement,
    } = req.body;

    // Validate input
    const { error } = vendorSignupSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // FIX 1: missing await + wrong function name
    const existingVendor = await Vendor.findOne({ businessName });

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor already exists",
      });
    }

    const newVendor = new Vendor({
      businessName,
      businessType,
      businessAddress,
      bankAccountname,
      bankAccountnumber,
      bankName,
      paymentMethodPreferences,
      businessRegCert,
      validID,
      termsandConditionsAgreement,
    });

    const result = await newVendor.save();

    return res.status(201).json({
      success: true,
      message: "Vendor account created successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating vendor",
      error: error.message,
    });
  }
};