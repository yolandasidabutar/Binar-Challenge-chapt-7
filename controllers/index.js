//FUNCTION TO ROUTE AND DISPLAY INDEX PAGE
function index(request, response) {
    response.render('index');
}
//Export Module to router.js
module.exports = {
    index
}