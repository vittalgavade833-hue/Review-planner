import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'article_created',
        'article_updated',
        'article_reviewed',
        'article_deleted',
        'owner_assigned',
        'user_created',
        'role_updated',
      ],
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    },
    articleTitle: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
