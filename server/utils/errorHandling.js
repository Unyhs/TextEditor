const sendError = (res, message, status = 500) => {
    return res.status(status).send({ success: false, message });
};

module.exports={sendError}