import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const postsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postsSchema);
