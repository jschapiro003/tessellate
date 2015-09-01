var express = require('express');
var morgan = require('morgan');
var app = express();

//use correct config file for development, production
app.config = require(__dirname + '/config/' + (process.env.NODE_ENV || 'development') + '/config');

//cloudinary api
app.cloudinary = require('cloudinary');
app.cloudinary.config(require(__dirname + '/config/cloudinary'));

// configure our server with all the middleware and and routing
require('./config/middleware.js')(app, express);

//========================
// start app
//========================

// startup our app
app.listen(app.config.port);

console.log('Server currently chillin on port ' + app.config.port);

// export for testing and flexibility
module.exports = app;
