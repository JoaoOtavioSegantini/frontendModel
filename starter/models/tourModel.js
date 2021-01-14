const mongoose = require('mongoose')
const slugify = require('slugify')
//const validator = require('validator')
/* const User = require('./userModel')
 */
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome da viagem é obrigatório'],
        unique: true,
        trim: true,
        maxlength: [40, 'Uma viagem deve ter no máximo 40 caracteres'],
        minlength: [10, 'Uma viagem deve ter no mínimo 10 caracteres'],
      //  validate: [validator.isALpha, 'O nome da viagem somente pode conter letras']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A duração da viagem é um campo obrigatório']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'O tamanho do grupo é requisito obrigatório']
    },
    difficulty: {
        type: String,
        required: [true, 'Uma viagem deve ter um nível de dificuldade especificado'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'A dificuldade somete pode assumir três valores: fácil, médio ou difícil'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating deve ser maior que 1.0'],
        max: [5, 'Rating deve ser menor do que 5.0']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'O preço da viagem é obrigatório']
    },
     priceDiscount: {
        type: Number,
        validate: {
          validator: function(val) {
            // this only points to current doc on NEW document creation
            return val < this.price;
          },
          message: 'O valor do disconto ({VALUE}) deve ser inferior ao preço regular'
        }
      },
    summary: {
        type: String,
        trim: true,
        required: [true, 'O campo descrição é obrigatório']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover:{
        type: String,
        required: [true, 'A imagem é requisito obrigatório']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: 
    {
        //GeoJson
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
          { 
              type: mongoose.Schema.ObjectId,
              ref: 'User'
            }  
          ]


}, { 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() há ainda o .post com o 'save'
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre('save', async function(next)  {
    const guidesPromises = this.guides.map( async id => await User.findById(id))
   this.guides = await Promise.all(guidesPromises);
    next();
});

// QUERY MIDDLEWARE
//tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function(next){
    this.find( { secretTour: { $ne: true}});

    this.start = Date.now();

    next()
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });

    next();
})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true }}})
    next();
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;