const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'O review não pode estar vazio']
    },
    rating: {
        type: Number,
        min: [1, "Rating deve ser maior que 1.0"],
        max: [5, 'Rating deve ser menor do que 5.0'],
        
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Cada review deve estar relacionado a pelo menos uma viagem']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Cada review deve estar relacinado a pelo menos um usuário']
    }
},
{ 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next){
    /* this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    }) */


    this.populate({
        path: 'user',
        select: 'name photo'
    })    
    next();
});


reviewSchema.statics.calcAverageRatings = async function(tourId){
   const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
      
    ]);
   // console.log(stats);
    // previne que, quando o documento foi totalmente deletando, ao dar um novo delete não retorne undefined
    if (stats.length > 0) {

        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRating
    
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingAverage: 4.5
    
        });
    }
   
};

reviewSchema.post('save', function(){
     
    this.constructor.calcAverageRatings(this.tour)
});

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();
    //console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function(next){

  await  this.r.constructor.calcAverageRatings(this.r.tour);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

