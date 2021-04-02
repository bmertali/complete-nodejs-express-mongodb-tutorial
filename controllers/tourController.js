// const { query } = require('express');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

// Param Middleware
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`)
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Invalid ID",
//     });
//   }
//   next()
// };

// exports.checkBody = (req,res,next) => {
//   if(!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     })
//   }
//   next()
// }




exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit()

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id);
    // Tour.findById(req.params.id) === Tour.findOne({ _id: req.params.id })

    if(!tour){
      return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });

});

exports.createTour = catchAsync(async (req, res,next) => {

  const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: 'success',
      data: {
        tour: newTour,
      },
    });

  // try {
  //   // const newTour = new Tour({})
  //   // newTour.save()

  //   const newTour = await Tour.create(req.body);

  //   res.status(201).send({
  //     status: 'success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!tour){
      return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
 
    // In a RESTful API, it is a common practice not to send back any data to the client when there was a delete operation
    // So, we don't use const x = await .....
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
      return next(new AppError('No tour found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  
});

// Data Aggregation -> MongoDB Aggregation Pipeline Stages
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // 4 tane easy, 3 tane medium, 2 tane difficult ve bunların alttaki özellikleri
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // avgPrice: 1 for ascending
      },
      // {
      //   $match: { _id: { $ne: 'EASY'}} // not equal = EASY
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // 1 = January
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, // 0 -> no longer show up, 1 -> it would actually show up
        },
      },
      {
        $sort: { numTourStarts: -1 }, // Descending order
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
});
