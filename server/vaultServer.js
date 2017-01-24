var express = require('express');
var bodyParser = require('body-parser');

var cors = require('cors');
var expressValidator = require('express-validator');


var user = require('./user.js')
var authenticate = require('./authenticate.js')
var app = express();

//body parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(expressValidator({
 customValidators: {
    notEquals: function(param, value) {
        return param!=value;
    }
 }
}));

//response header for avoiding cross domain issue
app.use(cors({
	exposedHeaders: ['Authorization']
}));




app.use('/vault', express.static(__dirname+ './../source'));
app.use('/login', user.login);
app.use('/user', authenticate);
app.use('/user/files', user.files);
app.use('/user/info', user.info);
app.use('/user', user.user);

app.listen(8080, function () {
	console.log("Vault Server started at http://localhost:8080");
});