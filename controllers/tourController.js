const { query } = require('express');
const Tour = require('../models/tourModel');

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
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}



exports.getAllTours = async (req, res) => {
  console.log(req.query);
  try {
    // BUILD QUERY
    // 1A) Filtering

    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    // { difficulty: 'easy', duration: { $gte: 5 }}
    // { difficulty: 'easy', duration: { gte: '5' }}
    // gte, gt , lte, lt

    let query = Tour.find(JSON.parse(queryStr));

    // 2) SORTING
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)  // Ascending order => ?sort=price  Descending order => ?sort=-price
      // sort('-price ratingsAverage')
    } else {
      query = query.sort('-createdAt')
    }

    // 3) FIELD LIMITING
    if(req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields) // Selecting only certain field names is called projecting
    } else {
      query = query.select('-__v') // Everything except __v  => başında eksi olunca bu anlama geliyor.
    }

    // 4) PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit

    // page=2&limit=10  => 1-10 page 1, 11-20 page 2, 21-30 page 3  
    // eğer sayfa 3 e gideceksek (21-30) ilk 20 kayıdı skip etmemiz lazım bu yüzden => skip(20)  
    query = query.skip(skip).limit(limit) 

    if(req.query.page) {
      const numTours = await Tour.countDocuments()
      if(skip >= numTours) throw new Error('This page does not exist!')
    }

    // EXECUTE QUERY
    const tours = await query;
    // query.sort().select().skip().limit()
    

    // const query =  Tour.find()
    // .where('duration').equals(5)
    // .where('difficulty').equals('easy')

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findById(req.params.id) === Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    // In a RESTful API, it is a common practice not to send back any data to the client when there was a delete operation
    // So, we don't use const x = await .....
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
