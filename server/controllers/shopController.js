const User = require('../models/User');
const Inventory = require('../models/Inventory');

// Available items definitions
const SHOP_ITEMS = {
  heart: { name: 'Extra Heart', cost: 10, currency: 'coins' },
  hint: { name: 'Hint Token', cost: 15, currency: 'coins' },
  shield: { name: 'Temporary Shield', cost: 25, currency: 'coins' }
};

const SKINS = {
  mauryan_warrior: { name: 'Mauryan Warrior', cost: 5, currency: 'diamonds' },
  gupta_scholar: { name: 'Gupta Scholar', cost: 10, currency: 'diamonds' },
  chola_voyager: { name: 'Chola Voyager', cost: 15, currency: 'diamonds' },
  gold_sutradhar: { name: 'Golden Sutradhar', cost: 25, currency: 'diamonds' }
};

// @desc    Get Shop and Inventory Status
// @route   GET /api/shop/status
// @access  Private
const getShopStatus = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ userId: req.user.id });
    res.json({
      success: true,
      shopItems: SHOP_ITEMS,
      skinsForSale: SKINS,
      inventory: {
        skins: inventory ? inventory.skins : ['default'],
        boosters: inventory ? inventory.boosters : [],
        coins: req.user.coins,
        diamonds: req.user.diamonds,
        hearts: req.user.hearts,
        activeSkin: req.user.activeSkin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Buy general shop items (hearts, hints, shield)
// @route   POST /api/shop/buy-item
// @access  Private
const buyItem = async (req, res) => {
  const { itemType, quantity } = req.body; // e.g., 'heart', 'hint', 'shield'
  const qty = parseInt(quantity) || 1;

  try {
    const item = SHOP_ITEMS[itemType];
    if (!item) {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    const totalCost = item.cost * qty;
    const user = await User.findById(req.user.id);

    if (user.coins < totalCost) {
      return res.status(400).json({ success: false, message: 'Insufficient coins' });
    }

    // Deduct coins
    user.coins -= totalCost;

    // Apply item benefit
    if (itemType === 'heart') {
      user.hearts += qty;
    }

    await user.save();

    // Sync Inventory
    const inventory = await Inventory.findOne({ userId: user._id });
    if (inventory) {
      inventory.coins = user.coins;
      if (itemType === 'shield') {
        for (let i = 0; i < qty; i++) {
          inventory.boosters.push('shield');
        }
      } else if (itemType === 'hint') {
        for (let i = 0; i < qty; i++) {
          inventory.boosters.push('hint');
        }
      }
      await inventory.save();
    }

    res.json({
      success: true,
      message: `Successfully purchased ${qty} ${item.name}(s)!`,
      user: {
        coins: user.coins,
        hearts: user.hearts,
        diamonds: user.diamonds
      },
      inventory: {
        boosters: inventory ? inventory.boosters : [],
        skins: inventory ? inventory.skins : ['default']
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Buy custom character skin using diamonds
// @route   POST /api/shop/buy-skin
// @access  Private
const buySkin = async (req, res) => {
  const { skinId } = req.body;

  try {
    const skin = SKINS[skinId];
    if (!skin) {
      return res.status(400).json({ success: false, message: 'Invalid skin selection' });
    }

    const user = await User.findById(req.user.id);
    const inventory = await Inventory.findOne({ userId: req.user.id });

    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }

    if (inventory.skins.includes(skinId)) {
      return res.status(400).json({ success: false, message: 'Skin already purchased' });
    }

    if (user.diamonds < skin.cost) {
      return res.status(400).json({ success: false, message: 'Insufficient diamonds' });
    }

    // Deduct diamonds, add skin
    user.diamonds -= skin.cost;
    user.skins.push(skinId);
    await user.save();

    inventory.diamonds = user.diamonds;
    inventory.skins.push(skinId);
    await inventory.save();

    res.json({
      success: true,
      message: `Successfully unlocked skin: ${skin.name}!`,
      user: {
        coins: user.coins,
        diamonds: user.diamonds,
        skins: user.skins
      },
      inventory: {
        skins: inventory.skins,
        diamonds: inventory.diamonds
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Equip a skin from inventory
// @route   POST /api/shop/equip-skin
// @access  Private
const equipSkin = async (req, res) => {
  const { skinId } = req.body;

  try {
    const inventory = await Inventory.findOne({ userId: req.user.id });
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }

    if (skinId !== 'default' && !inventory.skins.includes(skinId)) {
      return res.status(400).json({ success: false, message: 'You do not own this skin' });
    }

    const user = await User.findById(req.user.id);
    user.activeSkin = skinId;
    await user.save();

    res.json({
      success: true,
      message: `Equipped skin: ${skinId === 'default' ? 'Sutradhar Classic' : SKINS[skinId].name}`,
      activeSkin: user.activeSkin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Use a booster item from inventory
// @route   POST /api/shop/use-booster
// @access  Private
const useBooster = async (req, res) => {
  const { boosterType } = req.body; // e.g., 'shield', 'hint'

  try {
    const inventory = await Inventory.findOne({ userId: req.user.id });
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }

    const boosterIndex = inventory.boosters.indexOf(boosterType);
    if (boosterIndex === -1) {
      return res.status(400).json({ success: false, message: `You do not have a ${boosterType} in your inventory` });
    }

    // Remove one instance of this booster
    inventory.boosters.splice(boosterIndex, 1);
    await inventory.save();

    res.json({
      success: true,
      message: `Used one ${boosterType} booster!`,
      inventory: {
        boosters: inventory.boosters
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getShopStatus,
  buyItem,
  buySkin,
  equipSkin,
  useBooster
};
