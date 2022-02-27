const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const {engine} = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);

dotenv.config();
require('./config/passport')(passport);

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true},() => 
    console.log("connect to db")
);

//Body parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}, {extended: false}));

//Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
}));

//Handlebars Helpers
const {formatDate, truncate, stripTags, editIcon, select} = require('./helpers/hbs');

//Handlebarsaa
app.engine('.hbs', engine({
    helpers: {
        formatDate,
        truncate,
        stripTags,
        editIcon,
        select
    }, 
    defaulyLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DB_CONNECT})
}));

//Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next();
});

//Static folder
app.use(express.static(__dirname + '/public', {index: false}));
app.use(express.static(__dirname + '/views', {index: false}));

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/informations', require('./routes/informations'));
app.use('/follow', require('./routes/follow'));
app.use('/channel', require('./routes/channel'));

http_socket.listen(3000, () => console.log("server run and up"));

io_socket.on('connection', function(socket){
    console.log('connected');
    socket.on('c2s-join', function(msg){
        socket.join(msg.informationId);
    });
    socket.on('c2s-chat', function(msg){
        const Comment = require('./model/Comment');
        console.log(msg.userInfo);
        values = {
            information: msg.informationId,
            user: msg.userInfo.userId,
            comment: msg.comment
        };
        console.log(values);

        Comment.create(values);

        io_socket.to(msg.informationId).emit('s2c-chat', msg);
    });

    socket.on('channel-join', function(msg){
        socket.join(msg.channelId);
    });
    socket.on('channel-chat', function(msg){
        const Chat = require('./model/Chat');
        console.log(msg.userInfo);
        values = {
            channel: msg.channelId,
            user: msg.userInfo.userId,
            message: msg.message
        };
        console.log(values);

        Chat.create(values);

        io_socket.to(msg.channelId).emit('channel-chat', msg);
    });
});