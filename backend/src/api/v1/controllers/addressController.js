const asyncHandler = require("../../../utils/asyncHandler");
const {
  fetchUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../services/addressService");

// GET /users/me/addresses — list
const listMyAddresses = asyncHandler(async (req, res) => {
  const items = await fetchUserAddresses(req.user.id);
  res.status(200).json({ data: items });
});

// POST /users/me/addresses — create
const createMyAddress = asyncHandler(async (req, res) => {
  const { label, recipient_name, phone, address_line, city, country, is_default } = req.body;

  if (!recipient_name || !phone || !address_line) {
    return res.status(400).json({ message: "recipient_name, phone, and address_line are required" });
  }

  const address = await createAddress(req.user.id, {
    label,
    recipient_name,
    phone,
    address_line,
    city,
    country,
    is_default: Boolean(is_default),
  });

  res.status(201).json(address);
});

// PATCH /users/me/addresses/:id — update
const updateMyAddress = asyncHandler(async (req, res) => {
  const { label, recipient_name, phone, address_line, city, country, is_default } = req.body;
  const updates = {};
  if (label !== undefined) updates.label = label;
  if (recipient_name !== undefined) updates.recipient_name = recipient_name;
  if (phone !== undefined) updates.phone = phone;
  if (address_line !== undefined) updates.address_line = address_line;
  if (city !== undefined) updates.city = city;
  if (country !== undefined) updates.country = country;
  if (is_default !== undefined) updates.is_default = Boolean(is_default);

  const address = await updateAddress(req.params.id, req.user.id, updates);
  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }
  res.status(200).json(address);
});

// DELETE /users/me/addresses/:id — delete
const deleteMyAddress = asyncHandler(async (req, res) => {
  const ok = await deleteAddress(req.params.id, req.user.id);
  if (!ok) {
    return res.status(404).json({ message: "Address not found" });
  }
  res.status(204).send();
});

module.exports = {
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
};
