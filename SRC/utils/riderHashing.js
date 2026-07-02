const bcrypt = require('bcrypt');

exports.hashRider = async (password, saltRounds) => {

    return await bcrypt.hash(
        password,
        saltRounds
    );

};

exports.doHashValidation = async (
    password,
    hashedPassword
) => {

    return await bcrypt.compare(
        password,
        hashedPassword
    );

};