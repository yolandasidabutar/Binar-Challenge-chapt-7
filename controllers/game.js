//FUNCTION TO ROUTE AND DISPLAY GAME PAGE
function index(request, response) {
    response.status(200).json({
        msg: 'game page'
    });
}
//Export Module to router.js
module.exports = {
    index
}