const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const User = require('./../models/userModel');

exports.getOverview = catchAsync(async(req, res, next) => {
    //1 Puxar os dados da excursão da coleção

    const tours = await Tour.find();

    //2 Construir um template


    //3 Renderizar o template utilizando os dados do passo //1
    res.status(200).render('overview', {
        title: 'Todas excursões',
        tours
    });
});

exports.getTour = catchAsync(async(req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour) {
        return next(new AppError('Não há nenhuma excursão com este nome', 404));
    };

    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour',
        tour
    });
});

exports.getUser = catchAsync(async(req,res) => {
   // const user = await User.findOne(req.params.id);
 //   const password = await User.findOne(req.params.password);
 res.status(200).render('login', {
    title: 'Acesse a sua conta'
    })
});

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Sua conta'
        });
};

exports.updateUserData = catchAsync(async(req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name,
      email: req.body.email
  },{
      new: true,
      runValidators: true
  });
  res.status(200).render('account', {
    title: 'Sua conta',
    user: updatedUser
    });

});