const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const isPro = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const now = new Date();

    if (user.proGracePeriodEndsAt && new Date(user.proGracePeriodEndsAt).getTime() > now.getTime()) {
      res.setHeader('X-Pro-Grace-Period', 'active');
      req.user = user;
      return next();
    }

    if (user.proExpiresAt && new Date(user.proExpiresAt).getTime() < now.getTime()) {
      user.isPro = false;
      user.proSubscriptionId = null;
      user.proExpiresAt = null;
      await user.save();

      throw new ApiError(403, 'Pro subscription required. Upgrade at /api/subscriptions/upgrade');
    }

    if (user.isPro !== true) {
      throw new ApiError(403, 'Pro subscription required. Upgrade at /api/subscriptions/upgrade');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isPro,
};
