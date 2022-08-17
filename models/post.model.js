import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types; //could be mongoose.Schema

const postsSchema = new Schema(
  {
    _id: String,
    type: {
      type: String,
      enum: ['profilePicture', 'cover', null],
      default: null,
    },
    text: String,
    images: Array,
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    background: {
      type: String || null,
      default: null,
    },
    comments: [
      {
        _id: String,
        text: {
          type: String,
        },
        images: [{
          id: String,
          url: String,
        }],
        commentBy: {
          type: ObjectId,
          ref: 'User',
        },
        commentAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postsSchema);
