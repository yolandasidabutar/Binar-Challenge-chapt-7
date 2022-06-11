//FUNCTION TO ROUTE AND DISPLAY INDEX PAGE
function index(request, response) {
    response.send('list player');
}
//Export Module to router.js
module.exports = {
    index
}