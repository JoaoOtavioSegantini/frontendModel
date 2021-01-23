const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `O endereço a seguir é inválido ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `O dado do campo está duplicado: ${value}. Por favor use outro valor!`;

    console.log(value);
  
   
    return new AppError(message, 400);
  };
  const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };

const handleJWTError = err => new AppError('Token inválido. Por favor acesse a tela de log in novamente!!',401);
const handleJWTExpiredError = err => new AppError('Token expirado. Acesse a tela de login para renovar o seu token!', 401)

const sendErrorDev = (err, req, res) => {
     // A) API
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return  res.status(err.statusCode).render('error', {
            title: 'Ops...ocorreu algum erro!',
            msg: err.message

        });
    };
   


const sendErrorProd = (err, req, res) =>{
     // A) API
  if(req.originalUrl.startsWith('/api')){
       // A) Operational, trusted error: send message to client
        if(err.isOperational) {
         return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        } 
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR', err)

        //2) Enviar mensagem genérica
         return res.status(500).json({
            status: 'error',
            message: 'Ops...Alguma coisa deu errado!'
        });
      }
// B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
    if(err.isOperational) {
        console.log(err);
    return res.status(err.statusCode).render('error', {
        title: 'Ops...ocorreu algum erro!',
        msg: err.message
    });
   }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
   console.error('ERROR 💥', err);
   // 2) Send generic message
   return res.status(err.statusCode).render('error', {
     title: 'Something went wrong!',
     msg: 'Please try again later.'
   });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
   

    if(process.env.NODE_ENV === 'development'){
       
        sendErrorDev(err, req, res)
        
    } else if (process.env.NODE_ENV === 'production'){
        let error = { ...err };
        error.message = err.message;
      
        if(err.name === 'CastError')  error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

       sendErrorProd(error, req, res)

    }

    
} 


