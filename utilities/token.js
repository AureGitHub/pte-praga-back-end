var jwt = require("jwt-simple");
var SessionTime = require('./variables').SessionTime;
var JWT_SECRET = require('./variables').JWT_SECRET;

var  expiresIn = function(numMin) {
    var dateObj = new Date();
    return dateObj.setMinutes(dateObj.getMinutes() + numMin);
}


exports.OnlygenToken = function (IdUser, ip) {
    var expire = expiresIn(SessionTime); // Minutos de session
    var token = jwt.encode({
        expire: expire,
        idUser: IdUser,
        ip : ip
    }, JWT_SECRET);

    return {token , expire} ;
}