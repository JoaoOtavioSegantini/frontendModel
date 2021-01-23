const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) =>{

    const doc = await Model.findByIdAndDelete(req.params.id, req.body )   
     
           if(!doc) {
             return next(new AppError('Nenhum documento foi encontrada com esse ID', 404));
           }
               res.status(204).json({
                 status: 'success',
                 data: null
             });
         
         });

exports.updateOne = Model => catchAsync(async (req, res, next) =>{
 
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })   

    if(!doc) {
       return next(new AppError('Nenhum documento foi encontrada com esse ID', 404));
     }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
   })

   exports.createOne = Model => catchAsync(async (req, res, next) => {
    //  const newTour = new Tour({})
 
    //  newTour.save()
    const doc = await Model.create(req.body)

    res.status(201).json({
        status: 'success',
       data: {
           data: doc
       }
     })
   });

   exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) =>{
     let query = Model.findById(req.params.id);

   if(popOptions) query = query.populate(popOptions)
    const doc = await query;
    //const doc = await Model.findById(req.params.id).populate('reviews');
    
    if(!doc) {
      return next(new AppError('Nenhum documento foi encontrado com esse ID', 404));
    }
    
         res.status(200).json({
         status: 'success',
         data: {
            data: doc
          }
       }) 
  })

  exports.getAll = Model => catchAsync(async (req, res, next) =>{
  // Permite rotas aninhadas no verbo GET para as reviews hack...
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId }
   
  //EXECUTE QUERY
     const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
     const doc = await features.query;
  //para testes 
   //doc = await features.query.explain();
      res.status(200).json({
          status: 'success',
          results: doc.length,
          data: {
              data: doc
          }
      })
  });
    
    
    
    
      