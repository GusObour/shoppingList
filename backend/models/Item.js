const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters'],
    },
    quantity: {
      type: String,
      default: '1',
      trim: true,
    },
    store: {
      type: String,
      trim: true,
      default: '',
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    priority: {
      type: Number,
      default: 0,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
itemSchema.index({ listId: 1, priority: 1 });
itemSchema.index({ userId: 1, isDone: 1 });

// Update completedAt when isDone changes
itemSchema.pre('save', function (next) {
  if (this.isModified('isDone')) {
    this.completedAt = this.isDone ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
