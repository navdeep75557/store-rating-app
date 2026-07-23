const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

// GET /api/store-owner/dashboard
// Store Owner's own dashboard: list of users who rated their store + average rating
exports.dashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this account yet' });
    }

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
      order: [['createdAt', 'DESC']],
    });

    const avgResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'avgRating']],
      raw: true,
    });

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating: parseFloat(avgResult.avgRating) || 0,
      raters: ratings.map((r) => ({
        rating: r.rating,
        ratedAt: r.createdAt,
        user: r.user,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load store owner dashboard', error: err.message });
  }
};
