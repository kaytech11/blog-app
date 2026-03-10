const express = require('express');  // create server and handle routes
const mongoose = require('mongoose'); // connect node to db 
const methodOverride = require('method-override'); // allows put and delete from forms
const blogRoutes = require('./routes/blogRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const authroutes = require('./routes/authroutes');
const Blog = require('./models/Blog');
const { isLoggedIn } = require('./middleware/auth');


const app = express();
//connect to mongodb

mongoose.connect('mongodb+srv://kayodeomoniyi319_db_user:Kayisaac1.@cluster0.cqexvac.mongodb.net/blog-app')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "secretkey",       // protects session cookie 
  resave: false,  // dont save the session if nothing chnaged 
  saveUninitialized: false, // dont create a session until something is stored in it
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://kayodeomoniyi319_db_user:Kayisaac1.@cluster0.cqexvac.mongodb.net/blog-app",
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

//set view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use('/', authroutes); // register, login routes


// redirect home
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }

  try {
    // total blogs by user
    const totalBlogs = await Blog.countDocuments({ author: req.session.userId });

    // total reads
    const blogs = await Blog.find({ author: req.session.userId });
    let totalReads = 0;
    blogs.forEach(blog => {
      totalReads += blog.reads;
    });

    // render dashboard once with all data
    res.render('dashboard', { session: req.session, totalBlogs, totalReads });
  } catch (err) {
    console.log(err);
    res.send("Error loading dashboard");
  }
});



app.use('/blogs', require('./routes/blogRoutes'));
app.use('/uploads', express.static('public/uploads')); // serve uploaded images


// start sever 
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});






// note:EJS is a templating
//  engine that allows us to generate dynamic HTML pages
//  from the backend using JavaScript.


// note:method-override is a middleware that allows us
// to use HTTP verbs such as PUT and DELETE in
// places where the client doesn't support it,
// like HTML forms. It looks for a query parameter (in this case, _method)
// and treats the request as if it were using the specified HTTP method.


// note: without middleware,server cannot read letter but middleware
// the server opens the leatter and reads message.
// express.urlencoded is a middleware that parses
// incoming form data and allows to access it in request body.
//  It is used to handle form submissions and extract data from the request.
// It is a middleware that parses incoming form data and makes it available in req.body so we can access user input from forms.

// note: session creates a session for each user and stores session data on the server.
//  It allows us to maintain user state across multiple requests,
// such as keeping a user logged in or storing temporary data specific to a user.
// brower keeps cookie and send cookie to server with each request, server uses cookie to identify user and retrieve session data.


//persistent cookie: a cookie that remains on the user's device 
// for a specified period of time, even after the browser is closed.
//  It allows users to stay logged in or remember 
// preferences across sessions. In this code, 
// the cookie is set to expire
//  after 1 day (maxAge: 1000 * 60 * 60 * 24).

// Session cookies: a cookie that is stored in memory and
//  is deleted when the browser is closed.

//Secure cookie: a cookie that is only sent over HTTPS connections,
//  providing an additional layer of security by preventing
//  the cookie from being transmitted over unencrypted connections.

//csrf