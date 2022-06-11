// INITIATE MODUL
const express = require('express');
const morgan = require('morgan');
const route = require('./routes/router')
const app = express();
const PORT = 8000;

//VIEW ENGINE
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.json());
app.use(route);

//RUNNING EXPRESS SERVER USING PORT 8000
app.listen(PORT, () => {
    console.log(`Server is Runnning On Port ${PORT}`);
})

