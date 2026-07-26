const axios = require("axios");

const calculateDistance = async (pickupAddress, dropoffAddress) => {
    try {

        const response = await axios.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
                origin: {
                    address: pickupAddress
                },
                destination: {
                    address: dropoffAddress
                },
                travelMode: "DRIVE"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": "routes.distanceMeters"
                }
            }
        );

        if (
            !response.data.routes ||
            response.data.routes.length === 0
        ) {
            throw new Error("Unable to calculate delivery distance.");
        }

        const distanceMeters =
            response.data.routes[0].distanceMeters;

        const distanceKm = Number(
            (distanceMeters / 1000).toFixed(2)
        );

        return distanceKm;

    } catch (error) {

        throw new Error(
            error.response?.data?.error?.message ||
            "Failed to calculate delivery distance."
        );

    }
};

module.exports = {
    calculateDistance
};