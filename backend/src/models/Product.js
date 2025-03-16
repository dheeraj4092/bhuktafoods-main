import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['snacks', 'fresh', 'pickles-veg', 'pickles-nonveg', 'sweets', 'instant-premix', 'podi']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPreOrder: {
    type: Boolean,
    default: false
  },
  deliveryEstimate: {
    type: String
  },
  shipping: {
    domestic: {
      type: Boolean,
      default: true
    },
    international: {
      type: Boolean,
      default: false
    }
  },
  preparation: {
    type: String
  },
  ingredients: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, item) => acc + item.rating, 0) / this.ratings.length;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 