import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types; //could be mongoose.Schema

const commentsSchema = new Schema(
  {
    _id: ObjectId,
    user: {
      type: ObjectId,
      ref: 'User',
    },
    post: {
      type: ObjectId,
      ref: 'Post',
    },
    text: {
      type: String,
    },
    images: [
      {
        id: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model('Comment', commentsSchema);
