const express = require('express');
const router = express.Router();
const { getShopStatus, buyItem, buySkin, equipSkin } = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', getShopStatus);
router.post('/buy-item', buyItem);
router.post('/buy-skin', buySkin);
router.post('/equip-skin', equipSkin);

module.exports = router;
