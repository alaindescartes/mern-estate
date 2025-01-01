import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import mongoose from 'mongoose';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings. '));
    }
    try {
      await Listing.findByIdAndDelete(req.params.id);
      return res.status(200).json('listing successfully deleted.');
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  const listingId = req.params.id.trim();

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return next(errorHandler(400, 'Invalid ID format'));
  }

  try {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only update your own listings.'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(listingId, req.body, { new: true });

    return res.status(200).json(updatedListing);
  } catch (err) {
    next(err);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }
    return res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};
