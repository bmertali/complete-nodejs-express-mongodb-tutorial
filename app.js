const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); //body-parser
app.use(express.static(`${__dirname}/public`)); // serving static files
// app.use((req,res,next) => {
//     console.log('Hello from the middleware')
//     next()
// })
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 4) HANDLE UNHANDLED ROUTES

// ('*') -> everything
/**
 * Whenever we pass anything into next, it will assume that it is an error
 * and it will then skip all the other middlewares in the middleware stack
 * and sent the error that we passed in to our global error handling middleware
 */

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

// 5) ERROR HANDLING MIDDLEWARE

app.use(globalErrorHandler);

module.exports = app;
