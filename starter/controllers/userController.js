const User = require('./../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};
exports.getAllUsers =  catchAsync(async (req, res, next) =>{
    const users = await User.find()


    // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
})

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

exports.getUser =  (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'Esta rota não foi implementada ainda...'
    })
}
exports.createUser =  (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'Esta rota não foi implementada ainda...'
    })
}
exports.updateUser =  (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'Esta rota não foi implementada ainda...'
    })
}
exports.deleteUser =  (req, res) =>{
    res.status(500).json({
        status: 'error',
        message: 'Esta rota não foi implementada ainda...'
    })
}
