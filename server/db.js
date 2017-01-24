var mysql=require('mysql');
var connection=mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'vault'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected to mySql...');
});


module.exports = connection;