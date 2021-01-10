const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./../../models/tourModel')
dotenv.config({ path: './config.env'});



const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
         //.connect(process.env.DATABASE_LOCAL, {
       .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('A conexão com o Mongo foi realizada com sucesso!!!') /* console.log(con.connections); */)

//READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// IMPORT DATA INTO DB

const importData = async () => {
    try {
   await Tour.create(tours)
   console.log('Os dados foram carregados com sucesso!!!')
  
    } catch (err) {
        console.log(err)
    }
    process.exit()
} 


// DELETE ALL DATA FROM COLLECTIONS

const deleteData = async () =>{
    try {
        await Tour.deleteMany()
        console.log('Os dados foram deletados com sucesso!!!')
        
         } catch (err) {
             console.log(err)
         }
         process.exit()
}
if(process.argv[2] === '--import'){
    importData()
} else if(process.argv[2] === '--delete'){
    deleteData()
}
