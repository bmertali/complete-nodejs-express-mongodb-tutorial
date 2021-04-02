const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catching Uncaught Exceptions
// Senkron
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...')
  console.log(err.name, err.message)
  process.exit(1);
});


dotenv.config({ path: "./config.env" });
const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => {
  // console.log(con.connections)
  console.log('DB connection successful!')
  
})


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Errors Outside Express Unhandled Rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLER REJECTION! Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {  // we give the server, basically time to finish all the request that are still pending or being handled at the time
    process.exit(1);    // exit(0) => stands for a success exit(1) => stands for an uncaught exception.
  })
})

