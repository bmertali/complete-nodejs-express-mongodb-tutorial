const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {          
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'          // enum is only for strings
      }                               
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val){
          // this only point to current doc on NEW document creation
          return val < this.price;  
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // We can hide this from the output (e.g. Postman API GET Method)
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Properties
// We can't use arrow function because, an arrow function does not get its own this keyword
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Mongoose middleware

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this)
  // this keyword => point at the currently being saved document
  this.slug = slugify(this.name, { lower: true });
  next()
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...')
//   next()
// })

// tourSchema.post('save', function(doc, next) {
//   console.log(doc)
//   next()
// })

// QUERY MIDDLEWARE
//tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true }})
  this.start = Date.now()
  next()
})

tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now() - this.start} miliseconds!`)
  // console.log(docs)
  next()
})

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function(next) {

  this.pipeline().unshift({ $match: { secretTour: { $ne : true }}})

  // console.log(this.pipeline())
  next()
})

const Tour = mongoose.model('Tour', tourSchema); // Always uppercase on model names and variables

module.exports = Tour;
