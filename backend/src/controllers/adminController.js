const adminProductController = require('./adminProductController');
const adminOrderController = require('./adminOrderController');
const adminSettingsController = require('./adminSettingsController');

module.exports = {
  ...adminProductController,
  ...adminOrderController,
  ...adminSettingsController,
};
