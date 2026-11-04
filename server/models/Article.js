import mongoose from 'mongoose';
import { computeArticleReviewFields } from '../utils/reviewCalculator.js';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an article title'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide the article content'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'HR',
        'IT',
        'Finance',
        'Operations',
        'Security',
        'Product',
        'Engineering',
        'Other',
      ],
      default: 'Operations',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign an article owner'],
    },
    lastReviewedDate: {
      type: Date,
      required: [true, 'Please specify the last reviewed date'],
      default: Date.now,
    },
    reviewInterval: {
      type: Number,
      required: [true, 'Please specify a review interval (in days)'],
      enum: [30, 60, 90, 180, 365],
      default: 90,
    },
    nextReviewDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['CURRENT', 'DUE SOON', 'OVERDUE'],
      default: 'CURRENT',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewHistory: [
      {
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: auto-compute nextReviewDate and status
articleSchema.pre('save', function (next) {
  if (this.lastReviewedDate && this.reviewInterval) {
    const computed = computeArticleReviewFields(this.lastReviewedDate, this.reviewInterval);
    this.nextReviewDate = computed.nextReviewDate;
    this.status = computed.status;
  }
  next();
});

// Indexes for fast searching and filtering
articleSchema.index({ title: 'text', description: 'text', tags: 'text' });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ owner: 1 });
articleSchema.index({ nextReviewDate: 1 });

const Article = mongoose.model('Article', articleSchema);
export default Article;
