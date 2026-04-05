// backend/controllers/badgesController.js
const UserBadge = require('../models/UserBadge');
const BADGES = require('../data/badges');

// POST /api/badges/award
// Body: { badgeId }
exports.awardBadge = async (req, res) => {
    try {
        const { badgeId } = req.body;
        const userId = req.user._id;

        const badgeDef = BADGES.find((b) => b.id === badgeId);
        if (!badgeDef) return res.status(400).json({ message: 'Invalid badge ID' });

        // upsert — silently ignore if already earned
        const result = await UserBadge.findOneAndUpdate(
            { userId, badgeId },
            { userId, badgeId },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ awarded: true, badge: badgeDef });
    } catch (err) {
        // Duplicate key = already earned, that's fine
        if (err.code === 11000) return res.json({ awarded: false, message: 'Already earned' });
        console.error('Badge award error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/badges/my
exports.getMyBadges = async (req, res) => {
    try {
        const userId = req.user._id;
        const earned = await UserBadge.find({ userId }).sort({ earnedAt: -1 });
        const earnedIds = earned.map((b) => b.badgeId);

        // Return all badges, marking which are earned
        const allBadges = BADGES.map((b) => ({
            ...b,
            earned: earnedIds.includes(b.id),
            earnedAt: earned.find((e) => e.badgeId === b.id)?.earnedAt || null,
        }));

        res.json({ badges: allBadges, totalEarned: earnedIds.length });
    } catch (err) {
        console.error('Get badges error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
