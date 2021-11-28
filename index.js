const express = require('express');
const router = require('./router/router')

const app = express();

const host = 'localhost';
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/static', express.static('./static'));
app.use('/', router);

app.listen(port,host, ()=> console.log(`Webserver is running on http://${host}:${port}`));