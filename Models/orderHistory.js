const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define sub-schemas
const ribbonSchema = new Schema({
    text: String,
    textColor: String,
    topBackgroundColor: String,
    bottomBackgroundColor: String
  });
  
  const aggregatedRatingSchema = new Schema({
    rating: String,
    ratingCount: String,
    ratingCountV2: String
  });
  
  const ratingsSchema = new Schema({
    aggregatedRating: aggregatedRatingSchema
  });
  
  const itemSchema = new Schema({
    id: String,
    name: String,
    category: String,
    description: String,
    imageId: String,
    inStock: Number,
    isVeg: Number,
    price: Number,
    variants: Schema.Types.Mixed,
    variantsV2: Schema.Types.Mixed,
    itemAttribute: {
      vegClassifier: String
    },
    ribbon: ribbonSchema,
    showImage: Boolean,
    itemBadge: Schema.Types.Mixed,
    badgesV2: Schema.Types.Mixed,
    isBestseller: Boolean,
    ratings: ratingsSchema
  });
  
  const orderSchema = new Schema({
    date:{
      type:Date,
      default:Date.now
    },
    email: String,
    items: [itemSchema]
  });
  

// Create a model
const ItemModel = mongoose.model('orderHistory', orderSchema);


module.exports = ItemModel



