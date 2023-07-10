var jwt = require('jsonwebtoken');
const privateKey = "khkhj&^5234234((*23423";

const authCheck = (request, response, next) => {

    const token = request.body.token;

    try {
        var data = jwt.verify(token, privateKey);
        request.data = data;
        next();
    } catch (error) {
        return response.json({
            status: false,
            message: "Token is not valid"
        })
    }
}

module.exports = authCheck;