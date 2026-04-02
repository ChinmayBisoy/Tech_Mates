const calculateCommission = (amount, developer) => {
  let rate = 0.15;

  if (developer && developer.isPro) {
    rate = 0.1;
  }

  if (developer && developer.tier === 'elite') {
    rate = 0.08;
  }

  const platformFee = Math.round(amount * rate);
  const developerEarnings = amount - platformFee;

  return { platformFee, developerEarnings, rate };
};

module.exports = { calculateCommission };
