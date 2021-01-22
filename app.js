var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PORT, DB_CONNECTION_STRING, SALT } = process.env;
var indexRouter = require('./routes/index');

let cors = require('cors')

var app = express();
require('dotenv').config()
require('./scheduler/dropboxSchedule');
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
console.log(process.env.test)
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(PORT || 8000, (err) =>
    console.log(err ? err : `Server running on port ${PORT || 8000}...`)

);


module.exports = app;