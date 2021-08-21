require('dotenv').config({ silent: true });
const express = require('express');
const middleWarez = require('./index.js');
const https = require('https');
const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const port = process.env.PORT || 3000;

const app = express();
const server = https.createServer({ key, cert }, app);

// Initial page redirecting to Github
app.get('/auth', middleWarez.auth);

// Callback service parsing the authorization token
// and asking for the access token
app.get('/callback', middleWarez.callback);

app.get('/success', middleWarez.success);
app.get('/', middleWarez.index);

server.listen(port, () => {
  console.log("gandalf is walkin' on port " + port);
});
