require('dotenv').config();
const cors = require('cors');
const passport = require('./utils/passport-config');
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./utils/connectDB');
const postsRouter = require('./router/post/postsRouter');
const usersRouter = require('./router/user/usersRouter');
const categoriesRouter = require('./router/category/categoriesRouter');
const plansRouter = require('./router/plan/plansRouter');

//! Call the db
connectDB();

const app = express();

//! PORT
const PORT = 5000;

//! Middlewares
app.use(express.json()); //! Pass json data

//! Cors Middleware
const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
};

app.use(cors(corsOptions));

//! Passport Middleware
app.use(passport.initialize());
app.use(cookieParser()); //! Automatically parses the cookie

//! Route Handler
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/plans', plansRouter);

//! Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found on our server!',
  });
});

//! Error handling middleware
app.use((err, req, res, next) => {
  //! Prepare the error message
  const message = err.message;
  const stack = err.stack;

  res.status(500).json({
    message,
    stack,
  });
});

//! Start the server
app.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
