const User = require('./../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
    //1- Criar um erro se o usuário enviar um post de senha
  if(req.body.password || req.body.passwordConfirm) {
      return next(new AppError('Está rota não foi especificada para updates de senha. Por favor use /updateMyPassword', 400));
  }
   
    //body.role = 'admin'
    //2- Filtrar campos indesejáveis que não são permitidos a atualização

    const filteredBody = filterObj(req.body, 'name', 'email');

     //3- Atualizar as informações do usuário

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
      });
   
      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    });

exports.deleteMe = catchAsync(async(req, res, next) => {
 await User.findByIdAndUpdate(req.user.id, { active: false})


 res.status(204).json({
    status: 'success',
    data: null
  });

});


exports.createUser =  (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'Esta rota não foi implementada. Por favor use /signup ao invés desta'
    })
}

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Não dá para atualizar a senha com isso!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
