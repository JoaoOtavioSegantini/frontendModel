const Tour = require('./../models/tourModel')
const APIFeatures = require('../utils/apifeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}
/* const passeios = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))
 */
/* exports.checkID = (req, res, next, val) =>{
    console.log(`Tour id is ${val}`)
    if( req.params.id * 1 > passeios.length){
        return res.status(404).json({
            status: 'fail',
            message: 'ID Inválido'
        })
    }
next();

} */
/* exports.checkBody =(req, res, next) =>{
    if(!req.body.name || !req.body.price) {
        res.status(400).json({
            status: 'fail',
            message: 'Está faltando o nome ou o preço'
        })
    }
    next();
} */




exports.getAllTours = catchAsync(async (req, res, next) =>{
   

  /*  const queryObj = {...req.query}
   const excludedFields = ['page', 'sort', 'limit', 'fields']
   excludedFields.forEach( el => delete queryObj[el])


let queryStr = JSON.stringify(queryObj)
queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

let query = Tour.find(JSON.parse(queryStr)) */




// console.log(req.requestTime)
//console.log(req.body, queryObj)
//console.log(JSON.parse(queryStr))
//  const tours = await Tour.find(queryObj)

// try{
 
  


  /*  if(req.query.sort){
       const sortBy = req.query.sort.split(',').join(' ')
       query = query.sort(sortBy)
   } else {
       query = query.sort('-createdAt')
   } */

   /*  if(req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields)

    } else {
        query = query.select('-__v')
    } */

// PAGINATION
/* const page = req.query.page * 1 || 1
const limit = req.query.limit * 1 || 100
const skip = (page - 1) * limit

 query = query.skip(skip).limit(limit)

if(req.query.page){
    const numTours = await Tour.countDocuments();
    if(skip >= numTours) throw new Error('Esta página não existe')
} */

//EXECUTE QUERY
   const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
   const tours = await features.query;

    res.status(200).json({
        status: 'sucess',
       // requestedAt: req.requestTime,
        //results: passeios.length,
        results: tours.length,
        data: {
           // tours: passeios
            tours
        }
    })
//} catch (err) {
 //   res.status(404).json({
 //       status: 'fail',
//        message: err
//    })
//}
   })
exports.getTour = catchAsync(async (req, res, next) =>{

//  try{


 /*  const passeio = await Tour.findById(req.params.id).populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
  }); */
  const passeio = await Tour.findById(req.params.id).populate('reviews');


// É a mesma coisa que... Tour.findOne({ _id: req.params.id })
if(!passeio) {
  return next(new AppError('Nenhuma viagem foi encontrada com esse ID', 404));
}

  res.status(200).json({
    status: 'sucess',
   // results: passeio.length,
    data: {
        passeio
    }
}) 
  
//  } catch (err){
//res.status(404).json({
 //       status: 'fail',
//        message: err
 //   })
 // }

})





  //  const id = req.params.id * 1;
    
    /* if( id > passeios.length){
        return res.status(404).json({
            status: 'fail',
            message: 'ID Inválido'
        })
    } */
   /*  const passeio = passeios.find(el => el.id === id);
    
     res.status(200).json({
         status: 'sucess',
         results: passeios.length,
         data: {
             passeio
         }
     }) */

   exports.updateTour =  catchAsync(async (req, res, next) =>{
   /*  if( req.params.id * 1 > passeios.length){
        return res.status(404).json({
            status: 'fail',
            message: 'ID Inválido'
        })
    }
     */
  //  try {

   const passeioatualizado = await Tour.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
     })   

     if(!passeioatualizado) {
        return next(new AppError('Nenhuma viagem foi encontrada com esse ID', 404));
      }
     res.status(200).json({
         status: 'sucess',
         data: {
             passeio: passeioatualizado
         }
     })
 //   } catch (err) {
 //       res.status(404).json({
 //           status: 'fail',
   //         message: err
 //       })    
 //   }
    })
   exports.deleteTour = catchAsync(async (req, res, next) =>{

   // try {

  const tour = await Tour.findByIdAndDelete(req.params.id, req.body )   

      if(!tour) {
        return next(new AppError('Nenhuma viagem foi encontrada com esse ID', 404));
      }
          res.status(204).json({
            status: 'sucess',
            data: null
        })
   //      } catch (err) {
   //          res.status(404).json({
   //              status: 'fail',
    //             message: err
    //         })    
    //     }
    
    })

   

    exports.createTour = catchAsync(async (req, res, next) => {
    //  const newTour = new Tour({})
 
    //  newTour.save()
    newTour = await Tour.create(req.body)

    res.status(201).json({
        status: 'success',
       data: {
           tour: newTour
       }
        })



 // try {
  
      
      
      
        // console.log(req.body)
       /*  const newId = passeios[passeios.length -1].id + 1;
        const newTour = Object.assign({ id: newId}, req.body)
        
        passeios.push(newTour);
        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(passeios), err=>{
         res.status(201).json({
             status: 'sucess',
             data: {
                 passeio: newTour
                }
      //   })
 //       }) */
 //   } catch (err){

    //      res.status(400).json({
      //        status: 'fail',
   //           message: err +
       //       ' Os dados enviados são inválidos!'
          })
 //   }
         //res.send("Feito!")
  //      });

exports.getTourStats = catchAsync(async (req,res, next) =>{
 //   try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'},
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingQuantity'},
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },


                }
            },
            {
                $sort: { avgPrice: 1 }
            }
           /*  {
                $match: { _id: { $ne: 'EASY'}}
            } */
        ]);

        res.status(200).json({
            status: 'sucess',
            data: {
               stats
            }
        })

//    } catch (err) {
 //       res.status(400).json({
  //          status: 'fail',
    //        message: err
  //      })
//    }
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
 //   try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name'}
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },{
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'sucess',
        data: {
           plan
        }
    });

  //  } catch {
   //     res.status(400).json({
  //          status: 'fail',
 //           message: err
 //       });
 //   }
})