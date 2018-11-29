const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')

const PORT = 3000;
const api = require('./back-end/routes/api');
const yelp = require('./back-end/routes/yelp');

const app = express();
app.use(cors())

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname + '/public')));



app.use('/api', api);

app.use('/yelp', yelp);

app.get('/', function(req, res) {
    res.render(__dirname + '/index.html');
})

app.listen(process.env.PORT, function() {
    console.log("server running on localhost: ");
})