'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.ensureAuth = function(req,res,next){
	if(!req.headers.authorization){
		console.log(req.headers)
		return res.status(403).json({message: "Petition has no headers"});
	}
	var token = req.headers.authorization.replace(/['"]+/g,'');
	try {
		var payload = jwt.decode(token,secret);
		if(payload.exp <= moment().unix()){
			return res.status(401).json({message: "Token has expired"});
		}
	} catch(e) {
		// statements
		console.log(e);
		return res.status(403).json({message: "Invalid token"});
	}

	req.user = payload;

	next();
}