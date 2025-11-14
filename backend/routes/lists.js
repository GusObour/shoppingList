const express = require('express');
const { body, validationResult } = require('express-validator');
const List = require('../models/List');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/lists
// @desc    Get all lists for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { archived } = req.query;
    const isArchived = archived === 'true';

    const lists = await List.find({
      userId: req.user._id,
      isArchived,
    }).sort({ updatedAt: -1 });

    // Get item count for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const totalItems = await Item.countDocuments({ listId: list._id });
        const doneItems = await Item.countDocuments({
          listId: list._id,
          isDone: true,
        });

        return {
          ...list.toObject(),
          itemCount: totalItems,
          doneCount: doneItems,
        };
      })
    );

    res.json({
      success: true,
      count: listsWithCounts.length,
      lists: listsWithCounts,
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lists',
    });
  }
});

// @route   POST /api/lists
// @desc    Create a new list
// @access  Private
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('List name is required')
      .isLength({ max: 100 })
      .withMessage('List name cannot exceed 100 characters'),
    body('store').optional().trim(),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Please provide a valid hex color'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, store, color, budget, currency } = req.body;

    try {
      const list = await List.create({
        userId: req.user._id,
        name,
        store: store || '',
        color: color || '#007aff',
        budget: budget || null,
        currency: currency || 'USD',
      });

      res.status(201).json({
        success: true,
        message: 'List created successfully',
        list,
      });
    } catch (error) {
      console.error('Create list error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating list',
      });
    }
  }
);

// @route   GET /api/lists/:id
// @desc    Get a single list by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Get item counts
    const totalItems = await Item.countDocuments({ listId: list._id });
    const doneItems = await Item.countDocuments({
      listId: list._id,
      isDone: true,
    });

    res.json({
      success: true,
      list: {
        ...list.toObject(),
        itemCount: totalItems,
        doneCount: doneItems,
      },
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching list',
    });
  }
});

// @route   PUT /api/lists/:id
// @desc    Update a list
// @access  Private
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('List name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('List name cannot exceed 100 characters'),
    body('store').optional().trim(),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Please provide a valid hex color'),
    body('isArchived').optional().isBoolean(),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      const list = await List.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found',
        });
      }

      const { name, store, color, isArchived, budget, currency } = req.body;

      if (name !== undefined) list.name = name;
      if (store !== undefined) list.store = store;
      if (color !== undefined) list.color = color;
      if (isArchived !== undefined) list.isArchived = isArchived;
      if (budget !== undefined) list.budget = budget;
      if (currency !== undefined) list.currency = currency;

      await list.save();

      res.json({
        success: true,
        message: 'List updated successfully',
        list,
      });
    } catch (error) {
      console.error('Update list error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating list',
      });
    }
  }
);

// @route   DELETE /api/lists/:id
// @desc    Delete a list (and all its items)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Delete all items associated with this list
    await Item.deleteMany({ listId: list._id });

    // Delete the list
    await List.deleteOne({ _id: list._id });

    res.json({
      success: true,
      message: 'List and associated items deleted successfully',
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting list',
    });
  }
});

module.exports = router;
