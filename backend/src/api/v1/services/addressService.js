const { Address } = require("../models");
const sequelize = require("../../../config/database");

async function fetchUserAddresses(userId) {
  return Address.findAll({
    where: { user_id: userId },
    order: [["is_default", "DESC"], ["created_at", "DESC"]],
  });
}

async function fetchAddressById(id, userId) {
  return Address.findOne({ where: { id, user_id: userId } });
}

// If is_default is true, atomically clear default on all other rows for this
// user so there's only ever one default. Wrapped in a transaction.
async function createAddress(userId, data) {
  return sequelize.transaction(async (t) => {
    if (data.is_default) {
      await Address.update({ is_default: false }, { where: { user_id: userId }, transaction: t });
    }

    // If this is the user's first address, force it to be the default
    const existing = await Address.count({ where: { user_id: userId }, transaction: t });
    const isDefault = data.is_default || existing === 0;

    return Address.create(
      {
        user_id: userId,
        label: data.label ?? null,
        recipient_name: data.recipient_name,
        phone: data.phone,
        address_line: data.address_line,
        city: data.city ?? null,
        country: data.country ?? "Lebanon",
        is_default: isDefault,
      },
      { transaction: t },
    );
  });
}

async function updateAddress(id, userId, data) {
  return sequelize.transaction(async (t) => {
    const address = await Address.findOne({ where: { id, user_id: userId }, transaction: t });
    if (!address) return null;

    if (data.is_default === true) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId, id: { [require("sequelize").Op.ne]: id } }, transaction: t },
      );
    }

    return address.update(data, { transaction: t });
  });
}

async function deleteAddress(id, userId) {
  return sequelize.transaction(async (t) => {
    const address = await Address.findOne({ where: { id, user_id: userId }, transaction: t });
    if (!address) return false;

    const wasDefault = address.is_default;
    await address.destroy({ transaction: t });

    // Promote the next-most-recent address to default if we just deleted the default
    if (wasDefault) {
      const next = await Address.findOne({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        transaction: t,
      });
      if (next) await next.update({ is_default: true }, { transaction: t });
    }
    return true;
  });
}

module.exports = {
  fetchUserAddresses,
  fetchAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
