/**
 * items.controller.js
 *
 * In-memory store for now — filtered by userId.
 */

let items = [];
let nextId = 1;

// GET /api/items
const getAll = (req, res) => {
    // Filter items belonging to the authenticated user
    const userItems = items.filter(i => i.userId === req.user.uid);
    res.json(userItems);
};

// GET /api/items/:id
const getOne = (req, res) => {
    const item = items.find(i => i.id === Number(req.params.id) && i.userId === req.user.uid);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
};

// POST /api/items
const create = (req, res) => {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: '`title` is required' });

    const item = {
        id: nextId++,
        userId: req.user.uid, // Multi-user support
        title,
        description: description || '',
        status: status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    items.push(item);
    res.status(201).json(item);
};

// PUT /api/items/:id
const update = (req, res) => {
    const index = items.findIndex(i => i.id === Number(req.params.id) && i.userId === req.user.uid);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    items[index] = {
        ...items[index],
        ...req.body,
        id: items[index].id,           // prevent id override
        userId: items[index].userId,   // prevent userId override
        updatedAt: new Date().toISOString(),
    };
    res.json(items[index]);
};

// DELETE /api/items/:id
const remove = (req, res) => {
    const index = items.findIndex(i => i.id === Number(req.params.id) && i.userId === req.user.uid);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    const deleted = items.splice(index, 1)[0];
    res.json(deleted);
};

module.exports = { getAll, getOne, create, update, remove };
