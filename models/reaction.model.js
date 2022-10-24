import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const reactionSchema = new Schema({
  type: {
    type: String,
    enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'],
    required: true,
  },
  post: {
    type: ObjectId,
    ref: 'Post',
  },
  user: {
    type: ObjectId,
    ref: 'User',
  },
});

export const Reaction = mongoose.model('Reaction', reactionSchema);
