const express = require('express')

const tourController = require('./../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router();

//router.param('id', tourController.checkID)
// POST / tour / 12f3ad21/ reviews
// GET /tour/545df66/reviews
//GET/tour/55gfgs/reviews/9022ffdda

/* router
.route('/:tourId/reviews')
.post(authController.protect, authController.restrictTo('user'), reviewController.createReview)
 */
router.use('/:tourId/reviews', reviewRouter);

router
 .route('/top-5-cheap')
 .get(tourController.aliasTopTours, tourController.getAllTours)

router
 .route('/planejamento-mensal/:year')
 .get(tourController.getMonthlyPlan)

router
  .route('/estatisticas')
  .get(tourController.getTourStats)
  
router
.route('/')
.get( authController.protect ,tourController.getAllTours)
.post(tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin','lead-guide',), tourController.deleteTour)


module.exports = router;