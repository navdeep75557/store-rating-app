const { Op, fn, col, literal } = require('sequelize');
const { Store, Rating } = require('../models');

// GET /api/stores?name=&address=&sortBy=&order=
// Normal User view: store name, address, overall rating, and the logged-in user's own rating
exports.listStoresForUser = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const allowedSort = ['name', 'address', 'rating'];
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
        safeSortBy === 'rating' ? [[literal('rating'), safeOrder]] : [[safeSortBy, safeOrder]],
      subQuery: false,
    });

    const storeIds = stores.map((s) => s.id);
    const myRatings = await Rating.findAll({
      where: { userId, storeId: { [Op.in]: storeIds } },
    });
    const myRatingMap = {};
    myRatings.forEach((r) => {
      myRatingMap[r.storeId] = r.rating;
    });

    const result = stores.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      email: s.email,
      overallRating: parseFloat(s.get('rating')) || 0,
      myRating: myRatingMap[s.id] || null,
    }));

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list stores', error: err.message });
  }
};
