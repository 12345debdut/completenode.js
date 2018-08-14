var element;
function CallWebAPI() {
    console.log("hii");
    //console.log(token);
    var usertoken= localStorage.getItem('token');
    //console.log(usertoken);
    // New XMLHTTPRequest
    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:3000/api/profile", false);
    request.setRequestHeader("Authorization", usertoken);  
    request.send();
    //console.log(request);
    // view request status
    console.log(request.response);
    //console.log(element);
}
CallWebAPI();