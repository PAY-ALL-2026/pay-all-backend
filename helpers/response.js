function sendSuccess(res, message, data = null) {

    return res.json({
        success: true,
        message,
        data
    });

}

function sendError(res, message) {

    return res.json({
        success: false,
        message
    });

}

module.exports = {
    sendSuccess,
    sendError
};