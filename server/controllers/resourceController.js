import mongoose from 'mongoose';
import SafetyResource from '../models/SafetyResource.js';

// Haversine distance calculator helper in kilometers
const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * @desc    Get all safety resources with optional category and proximity filtering
 * @route   GET /api/resources
 * @access  Private (Protected by JWT)
 */
export const getResources = async (req, res, next) => {
  try {
    const { category, lat, lng, radius } = req.query;

    const filter = {};

    // 1. Category Filter Validation
    if (category && category !== 'all') {
      const validCategories = ['police', 'hospital', 'safe_haven'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category filter. Allowed: police, hospital, safe_haven, or all',
        });
      }
      filter.category = category;
    }

    // 2. Query resources from DB
    let resources = await SafetyResource.find(filter).lean();

    // 3. Optional Geolocation Distance Calculation
    if (lat !== undefined && lng !== undefined) {
      const userLat = Number(lat);
      const userLng = Number(lng);

      if (isNaN(userLat) || userLat < -90 || userLat > 90 || isNaN(userLng) || userLng < -180 || userLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude or longitude query parameters for distance calculation',
        });
      }

      // Append calculated distance (in km and meters) to each resource
      resources = resources.map((r) => {
        const distanceKm = calculateHaversineKm(userLat, userLng, r.latitude, r.longitude);
        return {
          ...r,
          distanceKm: Number(distanceKm.toFixed(2)),
          distanceMeters: Math.round(distanceKm * 1000),
        };
      });

      // Filter by radius if provided
      if (radius !== undefined) {
        const radiusKm = Number(radius);
        if (!isNaN(radiusKm) && radiusKm > 0) {
          resources = resources.filter((r) => r.distanceKm <= radiusKm);
        }
      }

      // Sort by proximity: closest first
      resources.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single safety resource by ID
 * @route   GET /api/resources/:id
 * @access  Private (Protected by JWT)
 */
export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Safety resource not found (invalid identifier)',
      });
    }

    const resource = await SafetyResource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Safety resource not found',
      });
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

