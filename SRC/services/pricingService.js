const PRICE_BANDS = [
    {
        min: 0,
        max: 2,
        price: 1000
    },
    {
        min: 2,
        max: 5,
        price: 1500
    },
    {
        min: 5,
        max: 10,
        price: 2200
    },
    {
        min: 10,
        max: 15,
        price: 3000
    },
    {
        min: 15,
        max: 20,
        price: 4000
    }
];

const calculateDeliveryPrice = (distance) => {

    if (typeof distance !== "number" || Number.isNaN(distance) || distance < 0) {
        throw new Error("Invalid delivery distance.");
    }

    const band = PRICE_BANDS.find(
        band => distance >= band.min && distance <= band.max
    );

    if (!band) {
        throw new Error("Delivery location is outside our service area.");
    }

    return {
        distance,
        price: band.price
    };
};

module.exports = {
    calculateDeliveryPrice,
    PRICE_BANDS
};