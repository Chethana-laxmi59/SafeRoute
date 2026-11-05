import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook for Browser Geolocation API.
 * Adheres strictly to privacy guidelines:
 * - Never queries GPS automatically on mount.
 * - Only queries GPS upon explicit user action (calling requestLocation).
 * - Distinguishes between all W3C error codes.
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'

  // Inspect initial permissions if Permissions API is supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => {
            setPermissionState(result.state);
          };
        })
        .catch(() => {
          // Permissions API query not supported for geolocation in some browsers
        });
    }
  }, []);

  /**
   * Request GPS coordinates explicitly
   * @param {Object} customOptions
   * @returns {Promise<{latitude, longitude, accuracy}>}
   */
  const requestLocation = useCallback((customOptions = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errObj = {
          code: 0,
          type: 'UNSUPPORTED',
          message: 'Geolocation is not supported by your current web browser.',
        };
        setError(errObj);
        setPermissionState('unsupported');
        return reject(errObj);
      }

      setLoading(true);
      setError(null);

      const options = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
        ...customOptions,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: position.timestamp,
          };
          setLocation(locData);
          setLoading(false);
          setPermissionState('granted');
          resolve(locData);
        },
        (geoError) => {
          setLoading(false);
          let errObj = {
            code: geoError.code,
            type: 'UNKNOWN',
            message: 'Unable to retrieve location.',
          };

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              setPermissionState('denied');
              errObj = {
                code: 1,
                type: 'PERMISSION_DENIED',
                message:
                  'Location access was denied. Please allow location access in your browser settings to share coordinates.',
              };
              break;
            case geoError.POSITION_UNAVAILABLE:
              errObj = {
                code: 2,
                type: 'POSITION_UNAVAILABLE',
                message:
                  'GPS position is currently unavailable. Please verify your device location services are enabled.',
              };
              break;
            case geoError.TIMEOUT:
              errObj = {
                code: 3,
                type: 'TIMEOUT',
                message:
                  'Location request timed out. Please try clicking "Locate Me" again.',
              };
              break;
            default:
              errObj = {
                code: 0,
                type: 'UNKNOWN',
                message: geoError.message || 'An unexpected geolocation error occurred.',
              };
          }

          setError(errObj);
          reject(errObj);
        },
        options
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    permissionState,
    requestLocation,
    clearLocation,
  };
};

export default useGeolocation;

