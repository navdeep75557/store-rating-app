const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

// POST /api/admin/users - Add a new user (Normal User or System Administrator)
exports.addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (!['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, address, password: hashed, role });

    res.status(201).json({
      message: 'User created',
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// POST /api/admin/stores - Add a new store (optionally linked to a Store Owner account)
exports.addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'ownerId must reference an existing Store Owner user' });
      }
    }

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create store', error: err.message });
  }
};

// GET /api/admin/stores?name=&email=&address=&sortBy=&order=
exports.listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const allowedSort = ['name', 'email', 'address', 'rating'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'rating']],
      },
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: ['Store.id'],
      order:
        safeSortBy === 'rating'
          ? [[literal('rating'), safeOrder]]
          : [[safeSortBy, safeOrder]],
      subQuery: false,
    });

    res.json({ stores });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list stores', error: err.message });
  }
};

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
exports.listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (role) where.role = role;

    const allowedSort = ['name', 'email', 'address', 'role'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role'],
      order: [[safeSortBy, safeOrder]],
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list users', error: err.message });
  }
};

// GET /api/admin/users/:id - Full detail; includes rating if the user is a Store Owner
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let rating = null;
    if (user.role === 'STORE_OWNER') {
      const store = await Store.findOne({ where: { ownerId: user.id } });
      if (store) {
        const result = await Rating.findOne({
          where: { storeId: store.id },
          attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'avgRating']],
          raw: true,
        });
        rating = parseFloat(result.avgRating) || 0;
      }
    }

    res.json({ user: { ...user.toJSON(), rating } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};
