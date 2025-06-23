import { Address } from "../models/address.model.js";

// Get all addresses of logged-in user
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json({ data: addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single address by ID (only if belongs to logged-in user)
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.json({ data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new address for logged-in user
export const createAddress = async (req, res) => {
  try {
    const { name, phone, addressLine, city, postalCode, country, isDefault } =
      req.body;

    // If isDefault is true, unset default from other addresses of user
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      userId: req.user._id,
      name,
      phone,
      addressLine,
      city,
      postalCode,
      country,
      isDefault: !!isDefault,
    });

    res.status(201).json({ message: "Address created", data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update address by ID (only own address)
export const updateAddress = async (req, res) => {
  try {
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) return res.status(404).json({ message: "Address not found" });

    res.json({ message: "Address updated", data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete address by ID (only own address)
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
