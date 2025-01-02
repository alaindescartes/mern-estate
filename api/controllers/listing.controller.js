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

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startindex) || 0;
    let offer = req.query.offer;

    if (offer !== undefined) {
      offer = { $in: [true, false] };
    }
    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === false) {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === false) {
      parking = { $in: [false, true] };
    }
    let type = req.query.type;
    if (type === undefined || type === 'all') {
      type = { $in: ['rent', 'sale'] };
    }

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      type,
      furnished,
      parking,
    })
      .sort({
        [sort]: order,
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
};
