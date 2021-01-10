const mongoose = require('mongoose')
const dotenv = require('dotenv')


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });

dotenv.config({ path: './config.env'});

const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
         //.connect(process.env.DATABASE_LOCAL, {
       .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('A conexão com o Mongo foi realizada com sucesso!!!') /* console.log(con.connections); */)

//console.log(process.env)


/* const testTour = new Tour({
    name: 'The Park Camper',
    
    price: 997

})

testTour.save().then(doc => {
    console.log(doc);
}).catch(err =>{
    console.log('ERROR:', err)
}) */

const port = process.env.PORT || 3000

const server = app.listen(port, () =>{
    console.log(`O App está sendo executado na porta ${port}`)
});

process.on('unhandledRejection', err =>{
    console.log(err.name, err.message);
    console.log('Conexão rejeitada...')
    server.close(() => {
        process.exit(1);
    })
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
  