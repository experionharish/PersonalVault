var express = require('express');
var jwt = require('jsonwebtoken');

var connection = require('./db.js');

var authRouter=express.Router();


authRouter.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers.authorization;
	console.log("token:"+token);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, 'iamlocked', function(err, decoded) {      
      if (err) {
   
      	if(err.name=='TokenExpiredError')
        	return res.json({ status: false, message: 'Session Expired!' });    
        else
        	return res.json({ status: false, message: 'Please login to access your Vault!' });    


      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        connection.query('SELECT uid FROM user WHERE username= ?', [decoded.username], function(err, rows) {
				
				if(err){

					return res.json({ status: false, message: 'Please login to access your Vault!' });    
				} else {
					var newtoken=jwt.sign({uid: decoded.uid,
					  username: decoded.username
					}, 'iamlocked', { expiresIn: 10*60 });
			        res.header('Authorization', newtoken);
			        res.header("Cache-Control","no-cache");
			        console.log(decoded.exp);  
			        next();
				}
		});		

        
      }
    });

  } else {

    return res.json({ 
        status: false, 
        message: 'No Access' 
    });
    
  }
});

module.exports = authRouter;