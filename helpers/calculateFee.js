function calculateFee(recipients) {

    if (recipients <= 5)
        return 500;

    if (recipients <= 15)
        return 1000;

    if (recipients <= 30)
        return 2000;

    if (recipients <= 100)
        return 3500;

    return 5000;

}

module.exports = calculateFee;