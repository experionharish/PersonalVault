var crypto = require('crypto');

var express = require('express');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var nodemailer = require('nodemailer');


var infoRouter=express.Router();
var loginRouter=express.Router();
var signupRouter=express.Router();
var userRouter=express.Router();
var fileRouter=express.Router();

var connection = require('./db.js');


//encryption key
var algorithm = 'aes256'; 
var key = 'iamlocked';

//nodemailer
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'vaultmailer@gmail.com', // Your email id
            pass: 'experionvault' // Your password
        }
    });

var mailData = {
    from: '"Personal Vault"mail@personalvault.com',
    subject: 'Verify Your Email | Personal Vault',
    
};


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
		
	console.log(req.body);
		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			loginStat.status=401;
			loginStat.message=errors[0].msg;
			res.send(loginStat);
		}
		else{

			//console.log(req.body);
			connection.query('SELECT uid,password,status FROM user WHERE username= ?', [req.body.userName], function(err, rows) {
				
				if(err){
					throw err;
				}
				else if(rows.length==0){
					loginStat.status=401;
					loginStat.message="Username not found";
				}
				else{
					if(rows[0].status==0){
						loginStat.status=401;
						loginStat.message="Email id not verified";
					}
					else if(rows[0].password===req.body.password){
						loginStat.status=200;
						loginStat.message="Login Success";
						loginStat.token = jwt.sign({
									  	uid: rows[0].uid,
									  	username: req.body.userName
									}, 'iamlocked', { expiresIn: 10*60 });
						
					}
					else{
						loginStat.status=401;
						loginStat.message="Incorrect Password";
							
					}
				}			
				res.send(loginStat);	
			});
		}	



	})
	.get(function(req, res){  //logout

		//if (req.session.userid) {
		//	req.session.destroy();
		//	console.log("logged out");
			res.header('Authorization', 'null');
			res.send("success");
		//};

	})
	.put(function(req, res){ //request reset password link

		var resetStat={}; // response JSON 

		req.sanitize('email').escape();
		req.sanitize('email').trim();
		req.checkBody('email', 'email is Empty').notEmpty();
		req.checkBody('email', 'Enter a valid Email ID').isEmail();

  		
		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			resetStat.status=401;
			resetStat.message=errors[0].msg;
			res.send(resetStat);
		}
		else{

			//console.log(req.body);
			connection.query('SELECT uid,name,username FROM user WHERE username= ?', [req.body.email], function(err, rows) {
				
				if(err){
					resetStat.status=401;
					resetStat.message="Unable to connect to server";
				}
				else if(rows.length==0){
					resetStat.status=401;
					resetStat.message="User not found";
				}
				else{
						resetStat.status=200;
						resetStat.message="Password reset link mailed. check inbox!";
						var token = jwt.sign({
									  	uid: rows[0].uid,
									  	username: req.body.email,
									  	resetPass:"yes"
									}, 'iamlocked', { expiresIn: 24*60*60 });
						mailData.to = req.body.email;
						mailData.html=`Hi ${rows[0].name},<br /><br />We heard that you lost your Vault password. Sorry about that!
										But don’t worry! You can use the following link within one day to reset your password:
							<br /><br /><a href="http://192.168.1.228:8080/vault/resetpassword.html?reset=${token}">Reset My Password</a>`;
						mailData.subject='Password Reset Link | Personal Vault';	
						transporter.sendMail(mailData,function(err){
						    if(err){
						        throw err;
							}
						});	
				}			
				res.send(resetStat);	
			});
		}	



	});


signupRouter.route('/:token') //verify email
	.get(function(req, res){
		jwt.verify(req.params.token, 'iamlocked', function(err, decoded) {      
      		if (!err) {
      			connection.query('UPDATE user SET status=? WHERE username=?', [1, decoded.username], function(err, result) {
				});
				res.redirect('http://localhost:3000');	
				//res.redirect('/vault?verify=yes');	
			}
		});	
	});

signupRouter.route('/')
	.post(function(req, res){

		var signupStat={}; // response JSON 

		req.sanitize('userName').escape();
		req.sanitize('userName').trim();
		req.checkBody('userName', 'Email Id is Empty').notEmpty();
		req.checkBody('userName', 'Enter a valid Email ID').isEmail();

		req.sanitize('name').escape();
		req.sanitize('name').trim();
		req.checkBody('name', 'Name is Empty').notEmpty();
		
		req.sanitize('password').escape();
		req.sanitize('password').trim();
  		req.checkBody('password', 'Password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		
  		req.sanitize('confirmPassword').escape();
		req.sanitize('confirmPassword').trim();
		req.checkBody('confirmPassword', 'Confirm Password do not match').notEmpty().equals(req.body.password);

		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			signupStat.status=401;
			signupStat.message=errors[0].msg;
			res.send(signupStat);
		}
		else{

			//console.log(req.body);
			var newUser={};
			newUser.name = req.body.name;
			newUser.username = req.body.userName;
			newUser.password = req.body.password;
			newUser.status = 0;
			
			mailData.to = newUser.username;
			var signuptoken=jwt.sign({
									  	username: req.body.userName
							}, 'iamlocked', { expiresIn: 100*60*60 });
			mailData.html=`Hi ${newUser.name},<br /><br />Help us secure your <b>Personal Vault</b> account by verifying your email address (${newUser.username}). This lets you access all of Personal Vault features.
							<br /><br /><a href="http://192.168.1.228:8080/signup/${signuptoken}">Verify Email Address</a>`;
			mailData.subject='Verify Your Email | Personal Vault';	
			connection.query('INSERT INTO user SET ?', newUser, function(err, result) {
				
				if(err){
					if(err.code=='ER_DUP_ENTRY'){
						signupStat.status=401;
						signupStat.message="User already exists";	
					}else{
						signupStat.status=401;
						signupStat.message="Unable to connect to server";
					}
				}
				else if(result.affectedRows==0){
					signupStat.status=401;
					signupStat.message="Something went wrong";
				}
				else{	
					console.log(result);
					signupStat.status=200;
					signupStat.message="Sign up success. Check inbox to verify your email id";
					transporter.sendMail(mailData,function(err){
					    if(err){
					        throw err;
						}
					});
				}			
				res.send(signupStat);	
			});
		}	



	});
	




userRouter.route('/')
	.get(function(req, res){
		//console.log(req.decoded);
		connection.query("SELECT name FROM user WHERE uid=?",[req.decoded.uid],function(err, rows){
			var user={};
			if(!err){
				user.status = true;
				user.data = rows[0].name;
				//console.log(name);
				res.send(user);
			}
			else{
				user.status = false;
				user.data = "null";
				res.send(user);
			}

		});
			
		
		
	});
userRouter.route('/password')
	.put(function(req, res){ //update password

		var passwordStat={}; // response JSON 

		req.checkBody('oldPassword', 'Old password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		req.checkBody('newPassword', 'New password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		req.checkBody('confirmPassword', 'Confirm Password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		req.checkBody('confirmPassword', 'Confirm Password do not match').notEmpty().equals(req.body.newPassword);

		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			passwordStat.status=401;
			passwordStat.message=errors[0].msg;
			res.send(passwordStat);
		}
		else{

			//console.log(req.body);
			connection.query('UPDATE user SET password=? WHERE uid=? AND password=?', [req.body.newPassword, req.decoded.uid, req.body.oldPassword], function(err, result) {
				
				if(err){
					passwordStat.status=401;
					passwordStat.message="Unable to connect to server";
				}
				else if(result.affectedRows==0){
					passwordStat.status=401;
					passwordStat.message="Old password is wrong";
				}
				else{	
					console.log(result);
					passwordStat.status=200;
					passwordStat.message="New password saved";
						
					
				}			
				res.send(passwordStat);	
			});
		}	



	})
	.post(function(req, res){ //reset password

		var passwordStat={}; // response JSON 

		req.checkBody('newPassword', 'New password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		req.checkBody('confirmPassword', 'Confirm Password is Empty').notEmpty().notEquals('d41d8cd98f00b204e9800998ecf8427e');
		req.checkBody('confirmPassword', 'Confirm Password do not match').notEmpty().equals(req.body.newPassword);

		var errors = req.validationErrors();
		//console.log(errors.length);
		
		if(errors.length!=undefined){
			passwordStat.status=401;
			passwordStat.message=errors[0].msg;
			res.send(passwordStat);
		}
		else{

			//console.log(req.body);
			connection.query('UPDATE user SET password=? WHERE uid=? ', [req.body.newPassword, req.decoded.uid], function(err, result) {
				
				if(err){
					passwordStat.status=401;
					passwordStat.message="Unable to connect to server";
				}
				else if(result.affectedRows==0){
					passwordStat.status=401;
					passwordStat.message="User not found";
				}
				else{	
					console.log(result);
					passwordStat.status=200;
					passwordStat.message="New password saved";
						
					
				}			
				res.send(passwordStat);	
			});
		}	



	});
  



infoRouter.route('/:infoID')
	.get(function(req, res){
				
		var infoData = {};
		
		connection.query("SELECT info_id, information.cat_id, category, name, card_number, cvv, password, DATE_FORMAT(start_date, '%d-%m-%Y') start_date, period, CONCAT(EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp_date, DATE_FORMAT(exp_date, '%d-%m-%Y') exp, type, notes, organisation, amount, interest, status, important,file FROM information,info_category WHERE information.cat_id=info_category.cat_id AND uid= ? AND info_id=?", [req.decoded.uid, req.params.infoID], function(err, rows) {

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
			var infoData = {};
			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else {
				infoData.status=200;
				infoData.message="success"; 
				res.send(infoData);
			}

		});
	})
	.post(function(req, res){    
				
		var infoData = {};
		if(req.params.infoID=='null')
			req.params.infoID='';
		connection.query("SELECT info_id, information.cat_id, category, name, card_number, cvv, password, DATE_FORMAT(start_date, '%Y-%m-%d') start_date, period, CONCAT(EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp_date, DATE_FORMAT(exp_date, '%Y-%m-%d') exp, type, notes, organisation, amount, interest, status, important,file FROM information,info_category WHERE information.cat_id=info_category.cat_id AND uid= ? AND (name LIKE ? OR organisation LIKE ? OR notes LIKE ? OR type LIKE ?)", [req.decoded.uid, '%'+req.params.infoID+'%', '%'+req.params.infoID+'%', '%'+req.params.infoID+'%', '%'+req.params.infoID+'%'], function(err, rows) {

			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else if(rows.length==0){
				infoData.length=0;
				infoData.message="No Match Found...";
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

	});




infoRouter.route('/')
	.get(function(req, res){

		var infoData = {};
		
		connection.query("SELECT info_id, category, name, DATE_FORMAT(created_on, '%r %d-%c-%Y') createdOn, card_number, cvv, password, CONCAT(EXTRACT( DAY FROM `start_date` ),'/' ,EXTRACT( MONTH FROM `start_date` ),'/' ,EXTRACT( YEAR FROM `start_date` )) start_date, period, CONCAT(EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp_date, CONCAT(EXTRACT( DAY FROM `exp_date` ),'/' ,EXTRACT( MONTH FROM `exp_date` ),'/' ,EXTRACT( YEAR FROM `exp_date` )) exp, type, notes, organisation, amount, interest, status, important,file FROM information,info_category WHERE information.cat_id=info_category.cat_id AND uid= ? ORDER BY important DESC, created_on DESC", [req.decoded.uid], function(err, rows) {

			if(err){
				infoData.length=0;
				infoData.message="Some Error with Sql...";
				res.send(infoData);
			}
			else if(rows.length==0){
				infoData.length=0;
				infoData.message="No Records Found on Your Vault!";
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
   				
 				res.send({status:400,message:"error"});
   			}

   			else{
   				res.send({status:200,message:"success"});
   			}
 		});
		
	})
	.put(upload.single('relfiles'), function(req, res){
		//console.log(req.params.uid);
		console.log("Files:"+req.file);
		req.body.information=JSON.parse(req.body.information);
		req.body.information.uid=parseInt(req.decoded.uid);
		if(req.file!=null)
			req.body.information.file=req.decoded.file;
		console.log(req.body.information);

		var cipher = crypto.createCipher(algorithm, key);  
		if(req.body.information.password!=null)
			req.body.information.password = cipher.update(req.body.information.password, 'utf8', 'hex') + cipher.final('hex');

		req.body.infoID=parseInt(req.body.infoID);
		connection.query('UPDATE information SET ? WHERE info_id=?', [req.body.information, req.body.infoID], function(err, result) {
   			// Neat!
   			
   			if(err){
   				
 				res.send({status:400,message:"error"});
   			}

   			else{
   				res.send({status:200,message:"success"});
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
	signup : signupRouter,
	info : infoRouter,
	user : userRouter,
	files : fileRouter
}





