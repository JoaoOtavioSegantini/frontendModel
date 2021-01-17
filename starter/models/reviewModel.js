const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [, 'O review não pode estar vazio']
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

