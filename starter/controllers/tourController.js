const multer = require('multer')
const sharp = require('sharp');
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  } else {
    cb(new AppError('Não é uma imagem! Por favor faça upload apenas de imagens.', 400), false)
  }
};
const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1},
    { name: 'images', maxCount: 3}
]);
//upload.single('image')
//upload.array('images', 5)

exports.resizeTourImages = catchAsync(async(req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;

    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
   // req.body.imageCover = imageCoverFilename;
   req.body.images = [];

   await Promise.all(req.files.images.map(async(file,i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;

    await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images.push(filename);

   }));
    next();
});

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




exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.updateTour =  factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

  /*  exports.deleteTour = catchAsync(async (req, res, next) =>{

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
 */
   

 exports.createTour = factory.createOne(Tour);


 
          
 

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

exports.getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next( new AppError("Por favor insira a latitude a longitude no formato especificado", 400))
    }
 //console.log(distance, lat, lng, unit);
const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]} }})

res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
        data: tours
    }
});
});

exports.getDistances = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next( new AppError("Por favor insira a latitude a longitude no formato especificado", 400))
    }
 
const distances = await Tour.aggregate([
    {
        $geoNear: {
            near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
        }
    },
    {
        $project: {
            distance: 1,
            name: 1,
        }
    }
]);

res.status(200).json({
    status: 'success',
    data: {
        data: distances
    }
});
});