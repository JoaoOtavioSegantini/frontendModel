const express = require('express')

const morgan = require('morgan')

const rateLimit = require('express-rate-limit')

const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')

const xss = require('xss-clean')

const hpp = require('hpp')

const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')

const userRouter = require('./routes/userRoutes')

const reviewRouter = require('./routes/reviewRoutes')

const app = express()

//1- MIDDLEWARE GLOBAL
// Segurança aos Header Http
app.use(helmet())

//console.log(process.env.NODE_ENV)
//Development logging
if(process.env.NODE_ENV === 'development'){
app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Há muitas requisições para o mesmo IP, por favor tente novamente daqui uma hora!'
});



app.use('/api', limiter);
//Body parser, reading data from body into rq.body
app.use(express.json({ limit: '10kb' }))

//Data sanitization against NoSQL query injection
app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

//Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'maxGroupSize', 'ratingsAverage', 'difficulty', 'price']
}))

//Serving static files

app.use(express.static(`${__dirname}/public`))

/* app.use((req, res, next) =>{
    console.log("Olá!!! Este é um middleware")
next()
}) */

app.use((req, res, next) =>{
    req.requestTime = new Date().toISOString();
next();
})

/* app.get('/', (req, res) => {res.status(200).json({message:"Olá!!!!!", app: "Natours"})}) 
*/



//app.get('/api/v1/passeios', getAllTours )
//app.get('/api/v1/passeios/:id', getTour)
//app.patch('/api/v1/passeios/:id', updateTour)
//app.delete('/api/v1/passeios/:id', deleteTour)
//app.post('/api/v1/passeios', createTour)

 
 
app.use('/api/v1/passeios', tourRouter);
app.use('/api/v1/vereadores', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {

    next(new AppError(`Não foi possível achar ${req.originalUrl} neste servidor!`, 404)); 
    
    /* res.status(404).json({
        status: 'fail',
        message: `Não foi possível achar ${req.originalUrl} neste servidor!`
    }) */

    /* const err = new Error(`Não foi possível achar ${req.originalUrl} neste servidor!`);
    err.status = 'fail';
    err.statusCode = 404;*/
   
})

app.use(globalErrorHandler)

module.exports = app;