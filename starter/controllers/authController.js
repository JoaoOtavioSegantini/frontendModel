const crypto = require('crypto')
const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>{
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createandSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions );

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
});
}

exports.signup = catchAsync(async ( req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  createandSendToken(newUser,201, res) ;
  /* const token = signToken(newUser._id);

  res.status(201).json({
    status: 'sucess',
    token,
    data: {
        user: newUser
    }
}) */
})

exports.login = catchAsync( async (req, res, next) => {
  const { email, password } = req.body

  // 1) Checar se o password e o email existem

 if(!password && !email) {
    return next(new AppError('Por favor informe a senha e password!', 400))
 }

  // 2) Checar se o usuário existe e o password está correto 

 const user = await User.findOne({ email }).select('+password')


  if(!user || !(await user.correctPassword(password, user.password))){
    return next(new AppError('O email ou a senha estão incorretos', 401))
  }

  // 3) Se tudo estiver certo, enviar o token para o client
  createandSendToken(user,200, res);
  /* const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token
}); */
})

exports.protect = catchAsync( async(req, res, next) => {

  //1) Coletar o token e fazer a sua verificação
  let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];

   } else if (req.cookies.jwt) {
     token = req.cookies.jwt;
   }

   if(!token){
     return next(new AppError('O usuário não está logado! Por favor acesse a tela de login para conseguir acesso', 401))
   }
  //2) Validação do token

 const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//console.log(decoded)

  //3) Checar se o usuário existe
     
  const freshUser = await User.findById(decoded.id);
  if(!freshUser){
    return next(new AppError('O usuário relativo ao token não existe',401))
  }

  //4)Checar se o usuário mudou a senha depois que o token foi gerado

   if(freshUser.changePasswordAfter(decoded.iat)) {
     return next( new AppError('O usuário recentemente mudou a senha. Por favor, acesse a tela de login novamente!', 401))
   }
   req.user = freshUser;
  next();

});
// Only for rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = freshUser;
     return  next();
    } 
  
  next();
});

/* exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
}; */

exports.restrictTo = (...roles) => {

  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError("Você não tem permissão para realizar esta ação!",403))
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {

// 1- Pegar o usuário baseado no seu email recebido

const user = await User.findOne({ email: req.body.email })
if(!user){
  return next(new AppError('Não há usuário com este email', 404))
}
//2- Gerar um token de reset de senha randômico
const resetToken = user.createPasswordResetToken();
await user.save({ validateBeforeSave: false });


//3-Manda lo de volta para o email do usuário
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/vereadores/resetPassword/${resetToken}`;
const message = `Esqueceu a senha? Envie um request com a sua nova senha e confirmação dela para: ${resetURL}.\nSe você não esqueceu a sua senha, por favor ignore este email.`;
try {
await sendEmail({
  email: user.email,
  subject: 'Token de reset da senha (válido por 10 minutos)',
  message
});

   res.status(200).json({
    status: 'success',
    message: 'O token foi enviado para o email!'
  });
 } catch (err) {
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError('Houve um erro ao enviar o email. Por favor tente mais tarde!', 500))
 }
});


exports.resetPassword =  catchAsync(async (req, res, next) => {
  //1- Pegar o usuário baseado no token

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ 
    passwordResetToken: hashedToken,
     passwordResetExpires: {$gt: Date.now()} })

  //2-Se o token não expirou, além de existir esse usuário, enviar um novo password

   if(!user) {
     return next(new AppError('Token inválido ou expirado',400))
   }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

  //3- Atualizar a propriedade do changedPasswordAt para o usuário

  //4- Logar o usuário e enviar o JWT
  createandSendToken(user,200, res);
 /*  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token
}); */

});

exports.updatePassword = catchAsync( async(req, res, next) => {
  // 1 - Identificar o usuário na coleção
 const user = await User.findById( req.user.id ).select('+password');
  

  // 2 - Chekar se o password enviado mediante requisição POST está correto
 if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
   return next( new AppError('Sua sehha atual está errada. Por favor, verifique!', 401))
 }

  //3 - Se estiver, atualizar o password
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
await user.save();
//User.findByIdAndUpdate não funcionará como você pensa!!!!

  //4 -Logar o usuário e enviar o JWT
  createandSendToken(user, 200, res) ;
});