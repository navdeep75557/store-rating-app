const { Store, Rating } = require('../models');

// POST /api/ratings - Submit a new rating (Normal User only, one rating per store)
exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const existing = await Rating.findOne({ where: { userId, storeId } });
    if (existing) {
      return res.status(409).json({ message: 'You have already rated this store. Use update instead.' });
    }

    const newRating = await Rating.create({ userId, storeId, rating });
    res.status(201).json({ message: 'Rating submitted', rating: newRating });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
};

// PUT /api/ratings/:storeId - Modify an existing rating (Normal User only)
exports.updateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const existing = await Rating.findOne({ where: { userId, storeId } });
    if (!existing) {
      return res.status(404).json({ message: 'You have not rated this store yet' });
    }

    existing.rating = rating;
    await existing.save();
    res.json({ message: 'Rating updated', rating: existing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rating', error: err.message });
  }
};
