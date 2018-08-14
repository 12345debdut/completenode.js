var element;
function CallWebAPI() {
    //console.log(token);
    var usertoken= localStorage.getItem('token');
    //console.log(usertoken);
    // New XMLHTTPRequest
    var request = new XMLHttpRequest();
    request.open("GET", "http://localhost:3000/api/auth/profile", false);
    request.setRequestHeader("Authorization", usertoken);  
    request.send();
    //console.log(request);
    // view request status
    element=JSON.parse(request.response);
    //console.log(element);
    return element;
}
const information=CallWebAPI();
sessionStorage.setItem('phonenumber',information.phonenumber);
console.log(information);