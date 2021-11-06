var express = require('express')
var app = express()
var mysql= require('mysql')
var myConnection= require('express-myconnection')
var config = require('./config')
var logger = require('morgan')
var dbOptions= {
  host:      config.database.host,
  user:       config.database.user,
  password: config.database.password,
  port:       config.database.port,
  database: config.database.db
}
app.use(logger('dev'));
app.use(myConnection(mysql, dbOptions, 'pool'))
app.set('view engine', 'ejs')

var index = require('./routes/index')
var calendar = require('./routes/calendar')

var expressValidator= require('express-validator')
app.use(expressValidator())
var bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
var methodOverride= require('method-override')
app.use(methodOverride(function (req, res) {
  if (req.body&& typeof req.body=== 'object' && '_method' in req.body) {
    // look in urlencodedPOST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
var flash = require('express-flash')
var cookieParser= require('cookie-parser');
var session = require('express-session');
app.use(cookieParser('keyboard cat'))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))
app.use(flash())
app.use('/', index)
app.use('/calendar', calendar)
app.listen(8000, function(){
  console.log('Server running at port 8000: http://localhost:8000')
})