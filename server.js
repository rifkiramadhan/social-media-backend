require('dotenv').config();
const cors = require('cors');
const passport = require('./utils/passport-config');
const express = require('express');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const connectDB = require('./utils/connectDB');
const postsRouter = require('./router/post/postsRouter');
const usersRouter = require('./router/user/usersRouter');
const categoriesRouter = require('./router/category/categoriesRouter');
const plansRouter = require('./router/plan/plansRouter');
const stripePaymentRouter = require('./router/stripePayment/stripePaymentRouter');
const calculateEarnings = require('./utils/calculateEarnings');
const { schedule } = require('node-cron');
const earningsRouter = require('./router/earning/earningsRouter');
const notificationsRouter = require('./router/notification/notificationsRouter');
const commentsRouter = require('./router/comment/commentsRouter');

//! Call the db
connectDB();

//! Schedule the task to run at 23:59 on the last day of every month
cron.schedule(
  '59 23 * * * ',
  async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (today.getMonth() !== tomorrow.getMonth()) {
      //! Calculate Earnings
      calculateEarnings();
    }
  },
  {
    schedule: true,
    timezone: 'America/New_York',
  }
);

const app = express();

//! PORT
const PORT = process.env.PORT || 5000;

//! Middlewares
app.use(express.json()); //! Pass json data

//! Cors Middleware
const URL = process.env.URL_CLIENT_PROD;
const corsOptions = {
  origin: [URL, 'https://social-media-frontend-sand.vercel.app'],
  credentials: 'include',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/v1/stripe', stripePaymentRouter);
app.use('/api/v1/earnings', earningsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/comments', commentsRouter);

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
