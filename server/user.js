var crypto = require('crypto');

var express = require('express');
var jwt = require('jsonwebtoken');
var multer  = require('multer');

var infoRouter=express.Router();
var loginRouter=express.Router();
var userRouter=express.Router();
var fileRouter=express.Router();

var connection = require('./db.js');


//encryption key
var algorithm = 'aes256'; 
var key = 'iamlocked';





// multipart form data handling
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,  __dirname + '/uploads')
  },
  filename: function (req, file, cb) {
    var filename = file.originalname;
    filename = filename.split(".")[0] + Date.now() + "." + filename.split(".")[1];
    req.decoded.file = filename;
    cb(null, filename);
  }
});
var upload = multer({ storage: storage });




loginRouter.route('/')
	.post(function(req, res){

		var loginStat={}; // response JSON 

		req.sanitize('userName').escape();
		req.sanitize('userName').trim();
		req.checkBody('userName', 'Username is Empty').notEmpty();
		req.checkBody('userName', 'Enter a valid Email ID').isEmail();

  		req.sanitize('password').escape();
		req.sanitize('password').trim();
  		req.checkBody('password', 'Password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		

		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			loginStat.status=401;
			loginStat.message=errors[0].msg;
			res.send(loginStat);
		}
		else{

			//console.log(req.body);
			connection.query('SELECT uid,password FROM user WHERE username= ?', [req.body.userName], function(err, rows) {
				
				if(err){
					throw err;
				}
				else if(rows.length==0){
					loginStat.status=401;
					loginStat.message="Username not found";
				}
				else{
					if(rows[0].password===req.body.password){
						loginStat.status=200;
						loginStat.message="Login Success";
						loginStat.token = jwt.sign({
									  	uid: rows[0].uid,
									  	username: req.body.userName
									}, 'iamlocked', { expiresIn: 10*60 });
						
					}
					else{
						loginStat.status=401;
						loginStat.message="Your password is incorrect";
							
					}
				}			
				res.send(loginStat);	
			});
		}	



	})
	.get(function(req, res){

		//if (req.session.userid) {
		//	req.session.destroy();
		//	console.log("logged out");
			res.send("Logged out successfully");
		//};

	});



userRouter.route('/')
	.get(function(req, res){
		//console.log(req.decoded);
		connection.query("SELECT name FROM user WHERE uid=?",[req.decoded.uid],function(err, rows){
			if(!err){

				var name = rows[0].name;
				//console.log(name);
				res.send(name);
			}
			else{
				res.send("error");
			}

		});
			
		
		
	});
  



infoRouter.route('/:infoID')
	.get(function(req, res){
				
		var infoData = {};
		
		connection.query("SELECT info_id, information.cat_id, category, name, card_number, cvv, password, DATE_FORMAT(start_date, '%Y-%m-%d') start_date, period, CONCAT(EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp_date, DATE_FORMAT(exp_date, '%Y-%m-%d') exp, type, notes, organisation, amount, interest, status, important,file FROM information,info_category WHERE information.cat_id=info_category.cat_id AND uid= ? AND info_id=?", [req.decoded.uid, req.params.infoID], function(err, rows) {

			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else if(rows.length==0){
				infoData.length=0;
				infoData.message="No Records Found on Your Store...";
				res.send(infoData);
			}
			else{

				rows.forEach(function(item){
					if(item.password!=null)
					{
						var decipher = crypto.createDecipher(algorithm, key);
						item.password = decipher.update(item.password, 'hex', 'utf8') + decipher.final('utf8');
					}
				});	

				infoData = JSON.stringify(rows);
				//console.log(infoData);
				res.send(infoData);
			}

		});

	})
	.delete(function(req, res){
		connection.query("DELETE FROM information WHERE info_id=?", [req.params.infoID], function(err, rows) {

			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else {
				
				res.send("success");
			}

		});
	});




infoRouter.route('/')
	.get(function(req, res){

		var infoData = {};
		
		connection.query("SELECT info_id, category, name, card_number, cvv, password, CONCAT(EXTRACT( DAY FROM `start_date` ),'/' ,EXTRACT( MONTH FROM `start_date` ),'/' ,EXTRACT( YEAR FROM `start_date` )) start_date, period, CONCAT(EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp_date, CONCAT(EXTRACT( DAY FROM `exp_date` ),'/' ,EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp, type, notes, organisation, amount, interest, status, important,file FROM information,info_category WHERE information.cat_id=info_category.cat_id AND uid= ? ORDER BY important DESC, created_on DESC", [req.decoded.uid], function(err, rows) {

			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else if(rows.length==0){
				infoData.length=0;
				infoData.message="No Records Found on Your Store...";
				res.send(infoData);
			}
			else{
				rows.forEach(function(item){
					if(item.password!=null)
					{
						var decipher = crypto.createDecipher(algorithm, key);
						item.password = decipher.update(item.password, 'hex', 'utf8') + decipher.final('utf8');
					}
				});	
					

				infoData = JSON.stringify(rows);
				//console.log(infoData);
				res.send(infoData);
			}

		});


		
	})
	.post(upload.single('relfiles'), function(req, res){
		//console.log(req.params.uid);
		console.log("Files:"+req.file);
		req.body.information=JSON.parse(req.body.information);
		req.body.information.uid=parseInt(req.decoded.uid);
		req.body.information.file=req.decoded.file;

		var cipher = crypto.createCipher(algorithm, key);  
		if(req.body.information.password!=null)
			req.body.information.password = cipher.update(req.body.information.password, 'utf8', 'hex') + cipher.final('hex');

		console.log(req.body.information);
		connection.query('INSERT INTO information SET ?', req.body.information, function(err, result) {
   			// Neat!

   			if(err){
 				res.send("error");
   			}

   			else{
   				res.send("success");
   			}
 		});
		
	})
	.put(upload.single('relfiles'), function(req, res){
		//console.log(req.params.uid);
		console.log("Files:"+req.file);
		req.body.information=JSON.parse(req.body.information);
		req.body.information.uid=parseInt(req.decoded.uid);
		req.body.information.file=req.decoded.file;
		console.log(req.body.information);

		var cipher = crypto.createCipher(algorithm, key);  
		if(req.body.information.password!=null)
			req.body.information.password = cipher.update(req.body.information.password, 'utf8', 'hex') + cipher.final('hex');

		req.body.infoID=parseInt(req.body.infoID);
		connection.query('UPDATE information SET ? WHERE info_id=?', [req.body.information, req.body.infoID], function(err, result) {
   			// Neat!
   			if(err){
 				res.send("error");
   			}

   			else{
   				res.send("success");
   			}
 		});
		//res.send("success");
		
	});


fileRouter.route('/:filename')
	.get(function(req, res){
		var file = __dirname + '/uploads/' + req.params.filename;
  		res.download(file);
	});


module.exports={
	login : loginRouter,
	info : infoRouter,
	user : userRouter,
	files : fileRouter
}





