const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const List = require('../models/List');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/lists/:listId/items
// @desc    Get all items for a specific list
// @access  Private
router.get('/lists/:listId/items', async (req, res) => {
  try {
    const { listId } = req.params;
    const { sortBy = 'priority', groupBy, isDone } = req.query;

    // Verify the list belongs to the user
    const list = await List.findOne({ _id: listId, userId: req.user._id });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Build query
    const query = { listId };
    if (isDone !== undefined) {
      query.isDone = isDone === 'true';
    }

    // Determine sort order
    let sortOption = {};
    switch (sortBy) {
      case 'priority':
        sortOption = { priority: 1, createdAt: 1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { priority: 1, createdAt: 1 };
    }

    const items = await Item.find(query).sort(sortOption);

    // If groupBy is requested, organize items accordingly
    let response = { items };

    if (groupBy === 'section') {
      const grouped = items.reduce((acc, item) => {
        const section = item.section || 'Uncategorized';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
      }, {});
      response.grouped = grouped;
    } else if (groupBy === 'store') {
      const grouped = items.reduce((acc, item) => {
        const store = item.store || list.store || 'No Store';
        if (!acc[store]) acc[store] = {};

        const section = item.section || 'Uncategorized';
        if (!acc[store][section]) acc[store][section] = [];
        acc[store][section].push(item);
        return acc;
      }, {});
      response.grouped = grouped;
    }

    res.json({
      success: true,
      count: items.length,
      ...response,
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
    });
  }
});

// @route   POST /api/lists/:listId/items
// @desc    Create a new item in a list
// @access  Private
router.post(
  '/lists/:listId/items',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Item name is required')
      .isLength({ max: 200 })
      .withMessage('Item name cannot exceed 200 characters'),
    body('quantity').optional().trim(),
    body('store').optional().trim(),
    body('section').optional().trim(),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    body('priority').optional().isNumeric(),
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

    const { listId } = req.params;

    try {
      // Verify the list belongs to the user
      const list = await List.findOne({ _id: listId, userId: req.user._id });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found',
        });
      }

      const { name, quantity, store, section, notes, priority } = req.body;

      // If priority not provided, set to end of list
      let itemPriority = priority;
      if (itemPriority === undefined) {
        const maxPriorityItem = await Item.findOne({ listId }).sort({
          priority: -1,
        });
        itemPriority = maxPriorityItem ? maxPriorityItem.priority + 1 : 0;
      }

      const item = await Item.create({
        listId,
        userId: req.user._id,
        name,
        quantity: quantity || '1',
        store: store || list.store || '',
        section: section || '',
        notes: notes || '',
        priority: itemPriority,
      });

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        item,
      });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating item',
      });
    }
  }
);

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Item name cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Item name cannot exceed 200 characters'),
    body('quantity').optional().trim(),
    body('store').optional().trim(),
    body('section').optional().trim(),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    body('priority').optional().isNumeric(),
    body('isDone').optional().isBoolean(),
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
      const item = await Item.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      const { name, quantity, store, section, notes, priority, isDone } =
        req.body;

      if (name !== undefined) item.name = name;
      if (quantity !== undefined) item.quantity = quantity;
      if (store !== undefined) item.store = store;
      if (section !== undefined) item.section = section;
      if (notes !== undefined) item.notes = notes;
      if (priority !== undefined) item.priority = priority;
      if (isDone !== undefined) item.isDone = isDone;

      await item.save();

      res.json({
        success: true,
        message: 'Item updated successfully',
        item,
      });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating item',
      });
    }
  }
);

// @route   PATCH /api/items/:id/toggle
// @desc    Toggle item isDone status
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    item.isDone = !item.isDone;
    await item.save();

    res.json({
      success: true,
      message: 'Item toggled successfully',
      item: {
        _id: item._id,
        isDone: item.isDone,
        completedAt: item.completedAt,
      },
    });
  } catch (error) {
    console.error('Toggle item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling item',
    });
  }
});

// @route   POST /api/items/reorder
// @desc    Reorder multiple items (bulk update priorities)
// @access  Private
router.post(
  '/reorder',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items array is required'),
    body('items.*.id').notEmpty().withMessage('Item ID is required'),
    body('items.*.priority')
      .isNumeric()
      .withMessage('Priority must be a number'),
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

    const { items } = req.body;

    try {
      // Verify all items belong to the user
      const itemIds = items.map((item) => item.id);
      const userItems = await Item.find({
        _id: { $in: itemIds },
        userId: req.user._id,
      });

      if (userItems.length !== itemIds.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more items not found',
        });
      }

      // Update priorities
      const updatePromises = items.map((item) =>
        Item.updateOne(
          { _id: item.id, userId: req.user._id },
          { priority: item.priority }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Items reordered successfully',
        updated: items.length,
      });
    } catch (error) {
      console.error('Reorder items error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reordering items',
      });
    }
  }
);

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    await Item.deleteOne({ _id: item._id });

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
    });
  }
});

module.exports = router;
