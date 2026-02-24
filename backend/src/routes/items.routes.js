const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items.controller');

// GET  /api/items       — list all items
router.get('/', itemsController.getAll);

// GET  /api/items/:id   — get one item
router.get('/:id', itemsController.getOne);

// POST /api/items       — create a new item
router.post('/', itemsController.create);

// PUT  /api/items/:id   — update an item
router.put('/:id', itemsController.update);

// DELETE /api/items/:id — delete an item
router.delete('/:id', itemsController.remove);

module.exports = router;
