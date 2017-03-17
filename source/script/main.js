
//Email validation
function validateEmail(email) {
    var regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regExp.test(email);
}

//Checking Empty Fields in an object
function validateString(infoObj){
    
    for(var key in infoObj) {
        var value = infoObj[key];
        if (!(/\S/.test(value)))
          return true;
    }

      
}
function nullString(value){
    
    if (!(/\S/.test(value)))
        return true;
    else
        return false;
}

function formatCardNo(fieldid){
    var cardNo = document.getElementById(fieldid).value;
    
    var v = cardNo.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    var matches = v.match(/\d{4,16}/g);
    var match = matches && matches[0] || ''
    var parts = []
    for (i=0, len=match.length; i<len; i+=4) {
       parts.push(match.substring(i, i+4))
    }
    if (parts.length) {
      document.getElementById(fieldid).value = parts.join(' ');
    } else {
      document.getElementById(fieldid).value = cardNo;
    }

}

//Validating Login credentials 
function login() {
    document.getElementById('activityLoader').style.display="block";

	var userName = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var loginMessage = document.getElementById("loginMessage");
    var password = (Crypto.MD5(password)).toString(); 

    
    if(validateEmail(userName)){ //validating email
        
        axios.post('http://192.168.1.228:8080/login', {
            userName: userName,
            password: password
        })
        .then(function (response) {
            if(response.data.status==401){ // invalid credentials
                loginMessage.style.color="#D8000C";
                loginMessage.innerHTML="<span class='glyphicon glyphicon-remove-circle'></span> " + response.data.message;
                document.getElementById('activityLoader').style.display="none";
            }
            else{ // login success
                setTimeout(function(){
                    window.location = "home.html";
                },500);
                localStorage.setItem("token", response.data.token);
                loginMessage.style.color="#4F8A10";
                loginMessage.innerHTML="<span class='glyphicon glyphicon-ok-circle'></span> " + response.data.message;
            } 

            
        })
        .catch(function (error) {
            console.log(error);
        });

	}
	else{  
        //invalid email address. warning message
		loginMessage.style.color="#9F8000";//"#9F6000";
        loginMessage.innerHTML="<span class='glyphicon glyphicon-alert'></span> Enter a valid Email Id";
        document.getElementById('activityLoader').style.display="none";
	}


}


function signUp() {
    var name = document.getElementById('name').value;
    var userName = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var signUpMessage = document.getElementById("signUpMessage");

    if(nullString(name) || nullString(userName) || nullString(password) || nullString(confirmPassword)){

        signUpMessage.style.color="#D8000C";
        signUpMessage.innerHTML="<span class='glyphicon glyphicon-alert'></span> All fields are mandatory";
    }
    else if(!validateEmail(userName)){
        signUpMessage.style.color="#9F6000";
        signUpMessage.innerHTML="<span class='glyphicon glyphicon-alert'></span> Invalid Email Id";
    }
    else if(password!=confirmPassword){
        signUpMessage.style.color="#D8000C";
        signUpMessage.innerHTML="<span class='glyphicon glyphicon-remove-circle'></span>Confirm Password do not match";
    }
    else {

        password=(Crypto.MD5(password)).toString();
        confirmPassword=(Crypto.MD5(confirmPassword)).toString();

        axios.post('http://192.168.1.228:8080/signup', {
            name: name,
            userName: userName,
            password: password,
            confirmPassword: confirmPassword
        })
        .then(function (response) {
            if(response.data.status==401){ // invalid credentials
                signUpMessage.style.color="#D8000C";
                signUpMessage.innerHTML="<span class='glyphicon glyphicon-remove-circle'></span> " + response.data.message;
            }
            else{ // login success
                setTimeout(function(){
                    window.location = "index.html";
                },3000);
                
                signUpMessage.style.color="#4F8A10";
                signUpMessage.innerHTML="<span class='glyphicon glyphicon-ok-circle'></span> " + response.data.message;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });


    }

}


function changePassword(){
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    if(nullString(oldPassword) && nullString(newPassword) && nullString(confirmPassword)){

        document.getElementById('passwordMessage').style.color="#D8000C";
        document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-alert'></span> All fields are mandatory";
    }
    else if(newPassword!=confirmPassword){
        document.getElementById('passwordMessage').style.color="#D8000C";
        document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-remove-circle'></span>Confirm Password do not match";
    }
    else {
        
        var oldPassword = (Crypto.MD5(oldPassword)).toString();
        var newPassword = (Crypto.MD5(newPassword)).toString();
        var confirmPassword = (Crypto.MD5(confirmPassword)).toString();
        axios.put('http://192.168.1.228:8080/user/password', {
            oldPassword:oldPassword,
            newPassword:newPassword,
            confirmPassword:confirmPassword
        },{headers: {'Authorization': localStorage.getItem("token")}})
        .then(function (response) {
            if(response.data.status==401){ // invalid password
                document.getElementById('passwordMessage').style.color="#D8000C";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-remove-circle'></span> " + response.data.message;
            }
            else{ // password saved successfully
                setTimeout(function(){
                    $("#passwordModal").modal("hide");
                },1500);
                localStorage.setItem("token", response.headers.authorization);
                document.getElementById('passwordMessage').style.color="#4F8A10";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-ok-circle'></span> " + response.data.message;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });

        
    }
}

function requestResetPassword(){

    var email = document.getElementById('resetEmail').value;
    if(nullString(email) || !validateEmail(email)){

        document.getElementById('passwordMessage').style.color="#D8000C";
        document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-alert'></span> Invalid Email Id";
    }
    else {
        
        axios.put('http://192.168.1.228:8080/login', {
            email:email
        })
        .then(function (response) {
            if(response.data.status==401){ // User not found
                document.getElementById('passwordMessage').style.color="#D8000C";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-remove-circle'></span> " + response.data.message;
            }
            else{ // password reset link mailed
                setTimeout(function(){
                    $("#forgotPasswordModal").modal("hide");
                },2000);
                document.getElementById('passwordMessage').style.color="#4F8A10";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-ok-circle'></span> " + response.data.message;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });

        
    }
}


function resetPassword(){

    var token = localStorage.getItem("resettoken");
    
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    if( nullString(newPassword) || nullString(confirmPassword)){

        document.getElementById('passwordMessage').style.color="#D8000C";
        document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-alert'></span> All fields are mandatory";
    }
    else if(newPassword!=confirmPassword){
        document.getElementById('passwordMessage').style.color="#D8000C";
        document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-remove-circle'></span>Confirm Password do not match";
    }
    else {
        
        
        var newPassword = (Crypto.MD5(newPassword)).toString();
        var confirmPassword = (Crypto.MD5(confirmPassword)).toString();
        axios.post('http://192.168.1.228:8080/user/password', {
            newPassword:newPassword,
            confirmPassword:confirmPassword
        },{headers: {'Authorization': token}})
        .then(function (response) {
            if(response.data.status==401 || response.data.status==false){ // invalid password
                document.getElementById('passwordMessage').style.color="#D8000C";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-remove-circle'></span> " + response.data.message;
            }
            else{ // password saved successfully
                setTimeout(function(){
                    window.location='index.html';
                },2000);

                localStorage.removeItem("resettoken");

                document.getElementById('passwordMessage').style.color="#4F8A10";
                document.getElementById('passwordMessage').innerHTML="<span class='glyphicon glyphicon-ok-circle'></span> " + response.data.message;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });

        
    }
}



//Adding new information to Vault.    also used for editing information if there is argument info_id
function addInfo(info_id){

    var infoType = document.getElementById('infoType').value;
    var fileName = document.getElementById('relatedFiles').value;
    var files = document.getElementById('relatedFiles').files;
    var formData = new FormData(document.getElementById("infoForm"));
    
    //formData.append("uid", "123");
    if(infoType=='1'){
        var information = {};
        information.cat_id = parseInt(infoType);
        information.name = document.getElementById('name').value;
        information.card_number = document.getElementById('cardNo').value.split(' ').join('');
        information.cvv = document.getElementById('cvv').value;
        information.password = document.getElementById('pin').value;
        information.exp_date = document.getElementById('expYear').value+'-'+document.getElementById('expMonth').value+'-01';
        information.notes = document.getElementById('note').value;
        information.organisation = document.getElementById('bank').value.toUpperCase();
        information.type = document.getElementById('type').value;
        if(document.getElementById('important').checked == true){
            information.important = 1;    
        }
        else{
            information.important = 0;    
        }
        if(files.length>0){
            information.file = fileName;    
        }
       
                
    }
    else if(infoType=='2'){
        var information = {};
        information.cat_id = parseInt(infoType);
        information.organisation = document.getElementById('organisation').value.toUpperCase();
        information.name = document.getElementById('username').value;
        information.password = document.getElementById('password').value;
        information.notes = document.getElementById('note').value;
        if(document.getElementById('important').checked == true){
            information.important = 1;    
        }
        else{
            information.important = 0;    
        }
        if(files.length>0){
            information.file = fileName;    
        }
    }
    else if(infoType=='3'){
        var information = {};
        information.cat_id = parseInt(infoType);
        information.organisation = document.getElementById('bank').value.toUpperCase();
        information.amount = parseInt(document.getElementById('amount').value);
        information.start_date = document.getElementById('datepicker').value.split("-").reverse().join("-");
        information.status = document.getElementById('status').value;
        information.period = parseFloat(document.getElementById('period').value);
        information.interest = parseFloat(document.getElementById('interest').value);
        information.notes = document.getElementById('note').value;
        if(document.getElementById('important').checked == true){
            information.important = 1;    
        }
        else{
            information.important = 0;    
        }
        if(files.length>0){
            information.file = fileName;    
        }
    }
    else if(infoType=='4'){
        var information = {};
        information.cat_id = parseInt(infoType);
        information.organisation = document.getElementById('company').value.toUpperCase();
        information.type = document.getElementById('type').value;
        information.amount = parseInt(document.getElementById('amount').value);
        information.exp_date = document.getElementById('datepicker').value.split("-").reverse().join("-");
        information.notes = document.getElementById('note').value;
        if(document.getElementById('important').checked == true){
            information.important = 1;    
        }
        else{
            information.important = 0;    
        }
        if(files.length>0){
            information.file = fileName;    
        }
    }
    else if(infoType=='5'){
        var information = {};
        information.cat_id = parseInt(infoType);
        information.organisation = document.getElementById('title').value.toUpperCase();
        information.notes = document.getElementById('note').value;
        if(document.getElementById('important').checked == true){
            information.important = 1;    
        }
        else{
            information.important = 0;    
        }
        if(files.length>0){
            information.file = fileName;    
        }
    }

    //validating fields
    if(validateString(information)){ // invalid .. error message
                document.getElementById('insert_status').innerHTML=`<div class="col-xs-12 col-sm-6 col-sm-offset-3 input_status">
                  <div class="alert alert-danger alert-dismissible">
                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                    <strong>Error!</strong> Empty Fields.
                  </div>
                </div>  `;
    }
    else{ // valid fields...

        formData.append("information", JSON.stringify(information));
        console.log(information);


        if(info_id==null){ // adding new data
            axios.post('http://192.168.1.228:8080/user/info', formData , {headers: {'Authorization': localStorage.getItem("token")}})
                .then(function (response) {
                    console.log(response.data); 
                    if(response.data.status==false){
                        //alert(response.data.message);
                        logout();
                    } 
                    else if(response.data.message=="success"){
                        document.getElementById('insert_status').innerHTML=`<div class="col-xs-12 col-sm-6 col-sm-offset-3 input_status">
                            <div class="alert alert-success alert-dismissible">
                                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                                <strong>Success!</strong> Information Saved.
                            </div>
                        </div>`;
                        document.getElementById('informations').innerHTML='';
                        localStorage.setItem("token", response.headers.authorization);
                        setTimeout(function(){
                            window.location="home.html";
                        },1000);
                    }
                    else{
                        document.getElementById('insert_status').innerHTML=`<div class="col-xs-12 col-sm-6 col-sm-offset-3 input_status">
                          <div class="alert alert-danger alert-dismissible">
                            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                            <strong>Error!</strong> Information Save error.
                          </div>
                        </div>  `;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        else{ //editing data
            formData.append("infoID", info_id);
            axios.put('http://192.168.1.228:8080/user/info', formData , {headers: {'Authorization': localStorage.getItem("token")}})
                .then(function (response) {
                    console.log(response.data); 
                    if(response.data.status==false){
                        //alert(response.data.message);
                        logout();
                    } 
                    else if(response.data.message=="success"){
                        
                        document.getElementById('insert_status').innerHTML=`<div class="col-xs-12 col-sm-6 col-sm-offset-3 input_status">
                            <div class="alert alert-success alert-dismissible">
                                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                                <strong>Success!</strong> Information Updated.
                            </div>
                        </div>`;
                        document.getElementById('informations').innerHTML='';
                        localStorage.setItem("token", response.headers.authorization);
                        setTimeout(function(){
                            window.location="home.html";
                        },1000);
                    }
                    else{
                        console.log(response.data.message);
                        document.getElementById('insert_status').innerHTML=`<div class="col-xs-12 col-sm-6 col-sm-offset-3 input_status">
                          <div class="alert alert-danger alert-dismissible">
                            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                            <strong>Error!</strong> Information Save error.
                          </div>
                        </div>  `;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
                
                return false;
        }    
    }   
    window.scrollTo(0, 10);     
    return false;    
}


// Deleting a particula information from vault
function deleteData(info_id){

    bootbox.confirm({
        message: "<font color='black'>Are you sure you want to delete this record?</font>",
        buttons: {
                    confirm: {
                        label: '<span class="glyphicon glyphicon-trash"></span> Delete',
                        className: 'btn-danger'
                    },
                    cancel: {
                        label: '<span class="glyphicon glyphicon-remove"></span> Cancel'
                    }
                    
                },
        callback:  function(result){  
                if(result){
                    axios.delete('http://192.168.1.228:8080/user/info/'+info_id, {headers: {'Authorization': localStorage.getItem("token")}})
                        .then(function (response) {
                            console.log(response.data); 
                            if(response.data.status==false){
                                //alert(response.data.message);
                                logout();
                            } 
                            else if(response.data.message=="success"){
                                localStorage.setItem("token", response.headers.authorization);
                                window.location="home.html";                
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                } 
         
            }
    });
}



//Validating access rights during page load... also fetch name of user
function authenticate() {
        console.log(localStorage.getItem("token"));
        axios.get('http://192.168.1.228:8080/user',{headers: {'Authorization': localStorage.getItem("token")}})
        .then(function (response) {
            //console.log(response.data.status);
            if(response.data.status==false){
                //alert("Hello");
                logout();
            }
            else{
                localStorage.setItem("token", response.headers.authorization);
                document.getElementById('name_of_user').innerHTML=response.data.data;
            }
        })
        .catch(function (error) {
            console.log(error);
        });  



}



//User logout
function logout(lout){
    if(lout === undefined) {
      lout = false;
    }
   
    if(localStorage.getItem('token')!=null && lout){
        bootbox.confirm({
            message: "<font color='black'>Are you sure you want to Log Out?</font>",
            buttons: {
                        confirm: {
                            label: 'Yes',
                            
                        },
                        cancel: {
                            label: '<span class="glyphicon glyphicon-remove"></span> Cancel'
                        }
                        
                    },
            callback:  function(result){
                if(result){ 
                    axios.get('http://192.168.1.228:8080/login',{headers: {'Authorization': null}})
                        .then(function (response) {
                            //console.log(response.data.status);
                            if(response.data=='success'){
                                localStorage.clear();
                                //alert('logout');
                                window.location="index.html";
                            }
                            
                        })
                        .catch(function (error) {
                            console.log(error);
                        });  
                    //localStorage.clear();
                    //window.location="index.html";
                }
                
            }
        });
    }
    else{
        localStorage.clear();
        window.location="index.html";
    }

}


// show and hide password field, pin field, card number field.
function showPassword(passwordId, buttonId) {

    var passwordField = document.getElementById(passwordId);
    var toggle = document.getElementById(buttonId);
    
    if (toggle.innerHTML == "<span class=\"glyphicon glyphicon-eye-open\"></span>"){
        passwordField.setAttribute('type', 'text');   
        toggle.innerHTML = "<span class='glyphicon glyphicon-eye-close'></span>";
    }
    else{
        passwordField.setAttribute('type', 'password');   
        toggle.innerHTML = "<span class='glyphicon glyphicon-eye-open'></span>";
    }
}

//Jquery datepicker
function datePicker() {
    $( "#datepicker" ).datepicker();
    $( "#datepicker" ).datepicker( "option", "dateFormat", "dd-mm-yy" );

}


// auto complete bank name
function loadBanks() {
    var availableBanks = [
      "Allahabad Bank",
"Andhra Bank",
"Axis Bank",
"Bank of Bahrain and Kuwait",
"Bank of Baroda - Corporate Banking",
"Bank of Baroda - Retail Banking",
"Bank of India",
"Bank of Maharashtra",
"Canara Bank",
"Central Bank of India",
"City Union Bank",
"Corporation Bank",
"Deutsche Bank",
"Development Credit Bank",
"Dhanlaxmi Bank",
"Federal Bank",
"ICICI Bank",
"IDBI Bank",
"Indian Bank",
"Indian Overseas Bank",
"IndusInd Bank",
"ING Vysya Bank",
"Jammu and Kashmir Bank",
"Karnataka Bank Ltd",
"Karur Vysya Bank",
"Kotak Bank",
"Laxmi Vilas Bank",
"Oriental Bank of Commerce",
"Punjab National Bank",
"Punjab & Sind Bank",
"Shamrao Vitthal Co-operative Bank",
"South Indian Bank",
"State Bank of Bikaner & Jaipur",
"State Bank of Hyderabad",
"State Bank of India",
"State Bank of Mysore",
"State Bank of Patiala",
"State Bank of Travancore",
"Syndicate Bank",
"Tamilnad Mercantile Bank Ltd.",
"UCO Bank",
"Union Bank of India",
"United Bank of India",
"Vijaya Bank",
"Yes Bank Ltd"
    ];
    $( "#bank" ).autocomplete({
      source: availableBanks
    });
  }




//Add, Edit information.   generate different forms for different type of data according to the select box
function gen_info_form(infoObj){
    
    if(infoObj==null){
        var infoType=document.getElementById('infoType').value;
        infoObj={};    
    }
    else{
        var infoType=infoObj.cat_id;
    }


    if(infoType=='1'){
        var formHtml = `<form id="infoForm" class="form-horizontal infoForm" onsubmit="return addInfo();" enctype="multipart/form-data">
          <div class="form-group">
            <label for="name" class="control-label col-sm-3">Name on Card :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z.\\s]+" title="Only Characters allowed" id="name" value="`+ (infoObj.name || ``) + `">
            </div>
          </div>
          <div class="form-group">
            <label for="bank" class="control-label col-sm-3">Bank Name :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9\\s]+" title="Only Characters, Numbers allowed" id="bank" value="`+ (infoObj.organisation || ``) + `">
            </div>  
          </div>
          <div class="form-group">
            <label class="control-label col-sm-3">Card Type :</label>
            <div class="col-sm-3">
                <select class="form-control" id="type">
                    <option value="VISA">VISA</option>
                    <option value="MasterCard">MasterCard</option>
                    <option value="RuPay">RuPay</option>
                </select>
            </div>
          </div>
          <div class="form-group">
            <label for="cardno" class="control-label col-sm-3">Card Number :</label>
            <div class="col-sm-6">
                <input type="text" onkeyup="formatCardNo('cardNo')" class="form-control" pattern="[0-9\\s]{19}" autocomplete="off" title="Card number should be 16 digits" id="cardNo" value="`+ (infoObj.card_number || ``) + `">
            </div>  
          </div>
           
          <div class="form-group col-sm-6">
            <label for="pin" class="control-label col-sm-6">PIN :</label>
            <div class="col-sm-5">
                <input type="password" class="form-control" pattern="[0-9]{4}" title="Only 4 digits allowed" id="pin" value="`+ (infoObj.password || ``) + `">
            </div>  
          </div>
          <div class="form-group col-sm-6">
            <label for="cvv" class="control-label col-sm-3">CVV :</label>
            <div class="col-sm-4">
                <input type="text" class="form-control" pattern="[0-9]{3,4}" title="CVV code can be 3 to 4 digits" id="cvv" value="`+ (infoObj.cvv || ``) + `">
            </div>  
          </div>
         
          <div class="form-group col-sm-12">
            <label for="expiry" class="control-label col-xs-12 col-sm-3">Expiry :</label>
            <div class="col-xs-5 col-sm-2">
                <select class="form-control" id="expMonth">
                    <option>Month</option>
                    <option value="01">Jan (01)</option>
                    <option value="02">Feb (02)</option>
                    <option value="03">Mar (03)</option>
                    <option value="04">Apr (04)</option>
                    <option value="05">May (05)</option>
                    <option value="06">June (06)</option>
                    <option value="07">July (07)</option>
                    <option value="08">Aug (08)</option>
                    <option value="09">Sep (09)</option>
                    <option value="10">Oct (10)</option>
                    <option value="11">Nov (11)</option>
                    <option value="12">Dec (12)</option>
                </select>
            </div>
            <div class="col-xs-5 col-sm-2">
                <select class="form-control" id="expYear">
                    <option>Year</option>
                    <option value="2013">2013</option>
                    <option value="2014">2014</option>
                    <option value="2015">2015</option>
                    <option value="2016">2016</option>
                    <option value="2017">2017</option>
                    <option value="2018">2018</option>
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    </select>
            </div>      
          </div> 
           <div class="form-group">
              <label for="note" class="control-label col-sm-3">Note :</label>
              <div class="col-sm-6">
                <textarea class="form-control" rows="3" id="note">`+ (infoObj.notes || ``) + `</textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Related Files :</label>
              <div class="col-sm-6">
                <input type="file" id="relatedFiles" name="relfiles">
              </div>
            </div>
         <div class="form-group">        
          <div class="col-xs-7 col-sm-offset-3 col-sm-3">
            <div class="checkbox">
                <label><input type="checkbox" id="important" `+ (infoObj.important || ``) + `>Mark as Important!</label>
            </div>
          </div>
          <div class="col-xs-5 col-sm-3">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
        </form>`;
        document.getElementById('informations').innerHTML=formHtml;

        document.getElementById('type').value=infoObj.type || '';
        document.getElementById('expMonth').value=infoObj.expMonth || '';
        document.getElementById('expYear').value=infoObj.expYear || '';
loadBanks();

    }
    else if(infoType=='2'){
        var formHtml=`<form id="infoForm" class="form-horizontal infoForm" onsubmit="return addInfo();" enctype="multipart/form-data">
        <div class="form-group">
            <label for="organisation" class="control-label col-sm-3">Service Name :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9.\\s]+" title="Only Characters, Numbers allowed" id="organisation" value="`+ (infoObj.organisation || ``) + `">
            </div>
          </div>
          <div class="form-group">
            <label for="username" class="control-label col-sm-3">Username :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" id="username" value="`+ (infoObj.name || ``) + `">
            </div>
          </div>
           <div class="form-group">
            <label for="pin" class="control-label col-sm-3">Password :</label>
            <div class="col-sm-6">
                <input type="password" class="form-control" id="password" value="`+ (infoObj.password || ``) + `">
            </div>  
          </div>
           <div class="form-group">
              <label for="note" class="control-label col-sm-3">Description :</label>
              <div class="col-sm-6">
                <textarea class="form-control" rows="3" id="note" placeholder="URL">`+ (infoObj.notes || ``) + `</textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Related Files :</label>
              <div class="col-sm-6">
                <input type="file" id="relatedFiles" name="relfiles">
              </div>
            </div>
         <div class="form-group">        
          <div class="col-xs-7 col-sm-offset-3 col-sm-3">
            <div class="checkbox">
                <label><input type="checkbox" id="important" `+ (infoObj.important || ``) + `>Mark as Important!</label>
            </div>
          </div>
          <div class="col-xs-5 col-sm-3">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
        </form>`;
        document.getElementById('informations').innerHTML=formHtml;
    }
    else if(infoType=='3'){
        var formHtml=`<form id="infoForm" class="form-horizontal infoForm" onsubmit="return addInfo();" enctype="multipart/form-data">
          <div class="form-group">
            <label for="bank" class="control-label col-sm-3">Bank Name :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9.\\s]+" title="Only Characters, Numbers allowed" id="bank" value="`+ (infoObj.organisation || ``) + `">
            </div>
          </div>
          <div class="form-group">
            <label for="amount" class="control-label col-sm-3">Amount :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[0-9]+" title="Only Numbers allowed" id="amount" value="`+ (infoObj.amount || ``) + `">
            </div>  
          </div>
          <div class="form-group col-sm-6">
            <label for="start_date" class="control-label col-sm-6">Start Date :</label>
            <div class="col-sm-5">
                <div class="input-group">
                    <input type="text" class="form-control" pattern="(0[1-9]|1[0-9]|2[0-9]|3[01])-(0[1-9]|1[012])-[0-9]{4}" title="YYYY-MM-DD" id="datepicker" value="`+ (infoObj.exp || ``) + `">
                    <div class="input-group-btn">
                      <button class="btn btn-default" type="button">
                        <i class="glyphicon glyphicon-calendar"></i>
                      </button>
                    </div>
                </div>
            </div>      
          </div>
          <div class="form-group col-sm-6">
            <label for="period" class="control-label col-sm-3">Status :</label>
            <div class="col-sm-4">
                <input type="text" class="form-control" id="status" placeholder="Open/Closed" value="`+ (infoObj.status || ``) + `">
            </div>  
          </div> 
          <div class="form-group col-sm-6">
            <label for="Interest" class="control-label col-sm-6">Interest Rate :</label>
            <div class="col-sm-5">
                <input type="text" class="form-control" id="interest" placeholder="Percentage" value="`+ (infoObj.interest || ``) + `">
            </div>  
          </div>  
          <div class="form-group col-sm-6">
            <label for="period" class="control-label col-sm-3">Period :</label>
            <div class="col-sm-4">
                <input type="text" class="form-control" pattern="[0-9.]+" title="Only Numbers allowed" id="period" placeholder="No. of years" value="`+ (infoObj.period || ``) + `">
            </div>  
          </div>
          
           <div class="form-group">
              <label for="note" class="control-label col-sm-3">Note :</label>
              <div class="col-sm-6">
                <textarea class="form-control" rows="3" id="note" >`+ (infoObj.notes || ``) + `</textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Related Files :</label>
              <div class="col-sm-6">
                <input type="file" id="relatedFiles" name="relfiles">
              </div>
            </div>
         <div class="form-group">        
          <div class="col-xs-7 col-sm-offset-3 col-sm-3">
            <div class="checkbox">
                <label><input type="checkbox" id="important" `+ (infoObj.important || ``) + `>Mark as Important!</label>
            </div>
          </div>
          <div class="col-xs-5 col-sm-3">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
        </form>`;
        document.getElementById('informations').innerHTML=formHtml;
        datePicker();
        $( "#datepicker" ).datepicker("setDate", infoObj.start_date);

    loadBanks();    
    }
    else if(infoType=='4'){
        var formHtml=`<form id="infoForm" class="form-horizontal infoForm" onsubmit="return addInfo();" enctype="multipart/form-data">
          <div class="form-group">
            <label for="company" class="control-label col-sm-3">Insurance Company :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9.\\s]+" title="Only Letters,Numbers allowed" id="company" value="`+ (infoObj.organisation || ``) + `">
            </div>
          </div>
          <div class="form-group">
            <label for="cardno" class="control-label col-sm-3">Insurance Type :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9\\s]+" title="Only Letters, Numbers allowed" id="type" value="`+ (infoObj.type || ``) + `">
            </div>  
          </div>
          <div class="form-group col-sm-6">
            <label for="expiry" class="control-label col-sm-6">Expiry :</label>
            <div class="col-sm-5">
                <div class="input-group">
                    <input type="text" class="form-control" pattern="(0[1-9]|1[0-9]|2[0-9]|3[01])-(0[1-9]|1[012])-[0-9]{4}" title="Invalid Date" id="datepicker" value="`+ (infoObj.exp || ``) + `">
                    <div class="input-group-btn">
                      <button class="btn btn-default" type="button">
                        <i class="glyphicon glyphicon-calendar"></i>
                      </button>
                    </div>
                </div>
            </div>      
          </div> 
           <div class="form-group col-sm-6">
            <label for="bank" class="control-label col-sm-3">Amount :</label>
            <div class="col-sm-4">
                <input type="text" class="form-control" pattern="[0-9]+" title="Only Numbers allowed" id="amount" value="`+ (infoObj.amount || ``) + `">
            </div>  
          </div>
          
           <div class="form-group">
              <label for="note" class="control-label col-sm-3">Note :</label>
              <div class="col-sm-6">
                <textarea class="form-control" rows="3" id="note">`+ (infoObj.notes || ``) + `</textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Related Files :</label>
              <div class="col-sm-6">
                <input type="file" id="relatedFiles" name="relfiles">
              </div>
            </div>
         <div class="form-group">        
          <div class="col-xs-7 col-sm-offset-3 col-sm-3">
            <div class="checkbox">
                <label><input type="checkbox" id="important" `+ (infoObj.important || ``) + `>Mark as Important!</label>
            </div>
          </div>
          <div class="col-xs-5 col-sm-3">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
        </form>`;
        document.getElementById('informations').innerHTML=formHtml;
        datePicker();
        $( "#datepicker" ).datepicker("setDate", infoObj.exp);
    }
    else if(infoType=='5'){
        var formHtml=`<form id="infoForm" class="form-horizontal infoForm" onsubmit="return addInfo();" enctype="multipart/form-data">
          <div class="form-group">
            <label for="bank" class="control-label col-sm-3">Title :</label>
            <div class="col-sm-6">
                <input type="text" class="form-control" pattern="[a-zA-Z0-9.\\s]+" title="Only Letters,Numbers allowed" id="title" value="`+ (infoObj.organisation || ``) + `">
            </div>
          </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Note :</label>
              <div class="col-sm-6">
                <textarea class="form-control" rows="3" id="note">`+ (infoObj.notes || ``) + `</textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="note" class="control-label col-sm-3">Related Files :</label>
              <div class="col-sm-6">
                <input type="file" id="relatedFiles" name="relfiles">
              </div>
            </div>
         <div class="form-group">        
          <div class="col-xs-7 col-sm-offset-3 col-sm-3">
            <div class="checkbox">
                <label><input type="checkbox" id="important" `+ (infoObj.important || ``) + `>Mark as Important!</label>
            </div>
          </div>
          <div class="col-xs-5 col-sm-3">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
        </form>`;
        document.getElementById('informations').innerHTML=formHtml;
    }
}

//generate the information box with data for home page according to the information type
function generatehtml(info){
    var imp=``;
    var file=``;
    var cardLastNo;
    if(info.card_number!=null){
        cardLastNo=info.card_number.substr(12, 16);
        info.card_number=info.card_number.substr(0, 12);
        info.card_number=info.card_number.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');

    }


    if(info.important==1){
        /*imp=`<div class="col-xs-2 col-md-1">
                <h5><span class="glyphicon glyphicon-star"></span></h5>
             </div>`;*/
         imp=` <span class="glyphicon glyphicon-star goldStar"></span> `;
    }         

    if(info.file!=null){

        file=`<div class="col-xs-4 moreInfoFields">
                        <h5>Related File:</h5>
                    </div>
                    <div class="col-xs-8 moreInfoFields">
                        <h5><a class="fileLink" href="http://192.168.1.228:8080/user/files/${info.file}?token=${localStorage.getItem('token')}"><span class="glyphicon glyphicon-open-file"></span> ${info.file}</a></h5>
                    </div>`;
    }
    if(info.category=="credit card"){

        return `<div class="col-sm-10 col-sm-offset-1 dataBox" data-toggle="collapse" data-target=".moreInfo${info.info_id}">
            <div class="row boxHeader">
                <div class="col-xs-5 col-md-8">
                    <h5>` + imp + `${info.organisation}</h5>
                </div>
                <div class="col-xs-5 col-md-3">
                    <h5><span class="glyphicon glyphicon-credit-card"></span> CREDIT CARD</h5>
                </div>
                <div class="col-xs-2 col-md-1 editDelete">
                    <h5><span class="glyphicon glyphicon-edit" onclick="editData(${info.info_id})"></span>&nbsp; <span class="glyphicon glyphicon-trash" onclick="deleteData(${info.info_id})"></span></h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-4 col-sm-2">
                    <h5>Card No.</h5>
                </div>
                <div class="col-xs-8 col-sm-4">
                    <h5>: <input class="cardField" id="card${info.info_id}" type="password" value="${info.card_number}" /> ${cardLastNo} <a id="show${info.info_id}card" onclick="showPassword('card${info.info_id}', this.id)"><span class='glyphicon glyphicon-eye-open'></span></a></h5>
                </div>
                <div class="col-xs-5 col-sm-2">
                    <h5>Name on Card</h5>
                </div>
                <div class="col-xs-7 col-sm-4">
                    <h5>: ${info.name}</h5>
                </div>
            
            </div>
            <div class="row">
                <div class="moreInfo${info.info_id} collapse">
                    <div class="col-xs-5 col-sm-2 moreInfoFields">
                        <h5>Card Type</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: ${info.type}</h5>
                    </div>
                    <div class="col-xs-5 col-sm-1 moreInfoFields">
                        <h5>CVV</h5>
                    </div>
                    <div class="col-xs-7 col-sm-1 moreInfoFields">
                        <h5>: ${info.cvv}</h5>
                    </div>
                    <div class="col-xs-5 col-sm-1 moreInfoFields">
                        <h5>PIN</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: <input class="passwordField" id="pword${info.info_id}" type="password" value="${info.password}" /><a id="show${info.info_id}" onclick="showPassword('pword${info.info_id}', this.id)"><span class='glyphicon glyphicon-eye-open'></span></a></h5>
                    </div>
                    <div class="col-xs-5 col-sm-1 moreInfoFields">
                        <h5>Exp</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: ${info.exp_date}</h5>
                    </div>

                    <div class="col-xs-4 moreInfoFields">
                        <h5>Notes :</h5>
                    </div>
                    <div class="col-xs-8 moreInfoFields">
                        <h5>${info.notes}</h5>
                    </div>` + file + `
                </div>
            </div>

        </div>`;
    }
    else if(info.category=="password"){

        return `<div class="col-sm-10 col-sm-offset-1 dataBox" data-toggle="collapse" data-target=".moreInfo${info.info_id}">
            <div class="row boxHeader">
                <div class="col-xs-5 col-md-8">
                    <h5>` + imp + `${info.organisation}</h5>
                </div>
                <div class="col-xs-5 col-md-3">
                    <h5><span class="glyphicon glyphicon-lock"></span> PASSWORD</h5>
                </div>
                <div class="col-xs-2 col-md-1 editDelete">
                    <h5><span class="glyphicon glyphicon-edit" onclick="editData(${info.info_id})"></span>&nbsp; <span class="glyphicon glyphicon-trash" onclick="deleteData(${info.info_id})"></span></h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-3 col-sm-2">
                    <h5>Username</h5>
                </div>
                <div class="col-xs-9 col-sm-5">
                    <h5>: ${info.name}</h5>
                </div>
                <div class="col-xs-5 col-sm-1">
                    <h5>Password</h5>
                </div>
                <div class="col-xs-7 col-sm-4">
                    <h5>: <input class="passwordField" id="pword${info.info_id}" type="password" value="${info.password}"> <a id="show${info.info_id}" onclick="showPassword('pword${info.info_id}', this.id)"><span class='glyphicon glyphicon-eye-open'></span></a></h5>
                </div>
            
            </div>
            <div class="row">
                <div class="moreInfo${info.info_id} collapse">
                    <div class="col-xs-4 moreInfoFields">
                        <h5>Notes : </h5>
                    </div>
                    <div class="col-xs-8 moreInfoFields">
                        <h5>${info.notes}</h5>
                    </div>` + file + `
                </div>
            </div>

        </div>`;
    }
    else if(info.category=="bank loan"){
        return `<div class="col-sm-10 col-sm-offset-1 dataBox" data-toggle="collapse" data-target=".moreInfo${info.info_id}">
            <div class="row boxHeader">
                <div class="col-xs-5 col-md-8">
                    <h5>` + imp + `${info.organisation}</h5>
                </div>
                <div class="col-xs-5 col-md-3">
                    <h5><span class="glyphicon glyphicon-piggy-bank"></span> BANK LOAN</h5>
                </div>
                <div class="col-xs-2 col-md-1 editDelete">
                    <h5><span class="glyphicon glyphicon-edit" onclick="editData(${info.info_id})"></span>&nbsp; <span class="glyphicon glyphicon-trash" onclick="deleteData(${info.info_id})"></span></h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-5 col-sm-2">
                    <h5>Amount:</h5>
                </div>
                <div class="col-xs-7 col-sm-4">
                    <h5>: &#8377;${info.amount}</h5>
                </div>
                <div class="col-xs-5 col-sm-2">
                    <h5>Status</h5>
                </div>
                <div class="col-xs-7 col-sm-4">
                    <h5>: ${info.status}</h5>
                </div>
            
            </div>
            <div class="row">
                <div class="moreInfo${info.info_id} collapse">
                    <div class="col-xs-5 col-sm-2 moreInfoFields">
                        <h5>Start Date</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: ${info.start_date}</h5>
                    </div>
                    <div class="col-xs-5 col-sm-2 moreInfoFields">
                        <h5>Period</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: ${info.period} Year</h5>
                    </div>
                    <div class="col-xs-5 col-sm-2 moreInfoFields">
                        <h5>Interest Rate</h5>
                    </div>
                    <div class="col-xs-7 col-sm-2 moreInfoFields">
                        <h5>: ${info.interest}%</h5>
                    </div>
                    

                    <div class="col-xs-4 moreInfoFields">
                        <h5>Notes : </h5>
                    </div>
                    <div class="col-xs-8 moreInfoFields">
                        <h5>${info.notes}</h5>
                    </div>` + file + `
                </div>
            </div>

        </div>`;

    }
    else if(info.category=="insurance"){
        return `<div class="col-sm-10 col-sm-offset-1 dataBox" data-toggle="collapse" data-target=".moreInfo${info.info_id}">
            <div class="row boxHeader">
                <div class="col-xs-5 col-md-8">
                    <h5>` + imp + `${info.organisation}</h5>
                </div>
                <div class="col-xs-5 col-md-3">
                    <h5><span class="glyphicon glyphicon-home"></span> INSURANCE</h5>
                </div>
                <div class="col-xs-2 col-md-1 editDelete">
                    <h5><span class="glyphicon glyphicon-edit" onclick="editData(${info.info_id})"></span>&nbsp; <span class="glyphicon glyphicon-trash" onclick="deleteData(${info.info_id})"></span></h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-5 col-sm-2">
                    <h5>Type</h5>
                </div>
                <div class="col-xs-7 col-sm-2">
                    <h5>: ${info.type}</h5>
                </div>
                <div class="col-xs-5 col-sm-2">
                    <h5>Amount</h5>
                </div>
                <div class="col-xs-7 col-sm-2">
                    <h5>: &#8377;${info.amount}</h5>
                </div>
                <div class="col-xs-5 col-sm-2">
                    <h5>Expiry</h5>
                </div>
                <div class="col-xs-7 col-sm-2">
                    <h5>: ${info.exp}</h5>
                </div>
            
            </div>
            <div class="row">
                <div class="moreInfo${info.info_id} collapse">
                    <div class="col-xs-4 moreInfoFields">
                        <h5>Notes : </h5>
                    </div>
                    <div class="col-xs-8 moreInfoFields">
                        <h5>${info.notes}</h5>
                    </div>` + file + `
                </div>
            </div>

        </div>`;
    }
    else if(info.category=="note"){
        return `<div class="col-sm-10 col-sm-offset-1 dataBox" data-toggle="collapse" data-target=".moreInfo${info.info_id}">
            <div class="row boxHeader">
                <div class="col-xs-5 col-md-8">
                    <h5>` + imp + `${info.organisation}</h5>
                </div>
                <div class="col-xs-5 col-md-3">
                    <h5><span class="glyphicon glyphicon-pencil"></span> NOTE</h5>
                </div>
                <div class="col-xs-2 col-md-1 editDelete">
                    <h5><span class="glyphicon glyphicon-edit" onclick="editData(${info.info_id})"></span>&nbsp; <span class="glyphicon glyphicon-trash" onclick="deleteData(${info.info_id})"></span></h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-4">
                    <h5>Notes : </h5>
                </div>
                <div class="col-xs-8">
                    <h5>${info.notes}</h5>
                </div>
            </div>
            <div class="row">
                <div class="moreInfo${info.info_id} collapse">
                    ` + file + `
                </div>
            </div>

        </div>`;

    }

}

//fetch all informations stored by a user from server and display it
function getData(){
    axios.get('http://192.168.1.228:8080/user/info', {headers: {'Authorization': localStorage.getItem("token")}})
        .then(function (response) {
            //console.log(response.data.length);

            if(response.data.status==false){
                //alert(response.data.message);
                logout();
            }    
            else if(response.data.length>0){
                response.data.forEach(function(info) {
                    var infohtml=generatehtml(info);

                    document.getElementById('informations').insertAdjacentHTML('beforeend', infohtml);

                    //    console.log(infohtml);
                });
                localStorage.setItem("token", response.headers.authorization);
            }
            else{
                document.getElementById('informations').innerHTML=` <div class="jumbotron">
                    <p>${response.data.message} <a class="fileLink" href="add.html"><span class="glyphicon glyphicon-plus-sign"></span> ADD NEW</a></p>  </div>`;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });  

}

//Search informations using a keyword from server and display it
function searchData(){
    var searchString=document.getElementById('searchInput').value.trim();
    if(searchString=='')
        var searchString=document.getElementById('searchInput-sm').value.trim();
    if(searchString==''){
        getData();
        searchString='null';
        return;
    }
    console.log(searchString);
    console.log(localStorage.getItem("token"));
    axios.post('http://192.168.1.228:8080/user/info/'+searchString,{} , {headers: {'Authorization': localStorage.getItem("token")}})
        .then(function (response) {
            //console.log(response.data.length);
            document.getElementById('informations').innerHTML='';
            if(response.data.status==false){
                //alert(response.data.message);
                logout();
            }    
            else if(response.data.length>0){
                response.data.forEach(function(info) {
                    var infohtml=generatehtml(info);

                    document.getElementById('informations').insertAdjacentHTML('beforeend', infohtml);

                    //    console.log(infohtml);
                });
                localStorage.setItem("token", response.headers.authorization);
            }
            else{
                document.getElementById('informations').innerHTML=` <div class="jumbotron">
                    <p>${response.data.message} </p>  </div>`;
            }    
            
        })
        .catch(function (error) {
            console.log(error);
        });  

}


//edit information page is loaded with old values
function editData(infoID){
    localStorage.setItem("editInfoID", infoID);
    window.location="edit.html";
}

function gen_edit_info_form(){
    var infoID=localStorage.getItem("editInfoID");
    console.log(infoID);
    axios.get('http://192.168.1.228:8080/user/info/'+infoID, {headers: {'Authorization': localStorage.getItem("token")}})
        .then(function (response) {
            //console.log(response.data.length);

            if(response.data.status==false){
                //alert(response.data.message);
                logout();
            }    
            else if(response.data.length==0){
                window.location="home.html";
                //response.data.forEach(function(info) {
                    //var infohtml=generatehtml(info);

                    //document.getElementById('informations').insertAdjacentHTML('beforeend', infohtml);

                    //    console.log(infohtml);
                //});
            }
            else{

                //var infohtml=generatehtml(response.data[0]);
                if(response.data[0].cat_id==1){
                    var month = response.data[0].exp_date.split('/')[0];
                    response.data[0].expMonth = parseInt( month ) < 10 ? '0'+month : month;
                    response.data[0].expYear=response.data[0].exp_date.split('/')[1];
                }
                document.getElementById('infoType').value=response.data[0].cat_id;
                response.data[0].important = response.data[0].important==0 ? '' : 'checked'; 
                gen_info_form(response.data[0]);


                document.getElementById("infoForm").setAttribute("onSubmit", "return addInfo('"+ response.data[0].info_id +"');");


                //document.getElementById('informations').insertAdjacentHTML('beforeend', infohtml);
                console.log(response.data[0]);
                //document.getElementById('informations').innerHTML=response.data.message;
                localStorage.setItem("token", response.headers.authorization);
            }    
            
        })
        .catch(function (error) {
            console.log(error);
    });  
}


