const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router()

// router.param('id', tourController.checkID)

// Create a checkBody middleware function
// Check if body contains the name and prie property
// If not, send back 400 (bad request)
// Add it to the post handler stack

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// GET /tour/234fad4/reviews/9564fd23

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRouter);


router.route('/tour-stats').get(tourController.getTourStats)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan,
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'))

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
// /tours-distance?distance=233&center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi  this look cleaner

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router.route('/').get(tourController.getAllTours)
.post(authController.protect, 
authController.restrictTo('admin', 'lead-guide'), 
tourController.createTour)

router.route('/:id').get(tourController.getTour)
.patch(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour)
.delete(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour);





module.exports = router;