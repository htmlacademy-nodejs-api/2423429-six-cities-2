import { Schema, Document, model, Types } from 'mongoose';
import { Offer, City, HousingType, Convenience } from '../helpers';


export interface OfferDocument extends Omit<Offer, 'host'>, Document {
  createdAt: Date;
  updatedAt: Date;
  host: Types.ObjectId;
}

const locationSchema = new Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { _id: false });

const offerSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [10, 'Min length for name is 10 characters'],
    maxlength: [100, 'Max length for name is 100 characters']
  },
  description: {
    type: String,
    required: true,
    minlength: [20, 'Min length for description is 20 characters'],
    maxlength: [1024, 'Max length for description is 1024 characters']
  },
  postDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  city: {
    type: String,
    enum: Object.values(City),
    required: true
  },
  previewImage: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: (images: string[]) => images.length === 6,
      message: 'Must have exactly 6 images'
    }
  },
  isPremium: {
    type: Boolean,
    required: true,
    default: false
  },
  isFavorite: {
    type: Boolean,
    required: true,
    default: false
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Min rating is 1'],
    max: [5, 'Max rating is 5']
  },
  type: {
    type: String,
    enum: Object.values(HousingType),
    required: true
  },
  rooms: {
    type: Number,
    required: true,
    min: [1, 'Min rooms is 1'],
    max: [8, 'Max rooms is 8']
  },
  guests: {
    type: Number,
    required: true,
    min: [1, 'Min guests is 1'],
    max: [10, 'Max guests is 10']
  },
  price: {
    type: Number,
    required: true,
    min: [100, 'Min price is 100'],
    max: [100000, 'Max price is 100000']
  },
  conveniences: {
    type: [String],
    required: true,
    enum: Object.values(Convenience)
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  location: {
    type: locationSchema,
    required: true
  }
}, {
  timestamps: true,
  collection: 'offers'
});

export const OfferModel = model<OfferDocument>('Offer', offerSchema);
