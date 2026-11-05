import rateLimit from 'express-rate-limit';

/**
 * Express Rate Limiting Configurations
 * Protects endpoints against denial of service (DoS) and credential stuffing attacks.
 * Gracefully bypassed during automated unit/integration test runs.
 */

const isTestEnv = process.env.NODE_ENV === 'test';

// Standard response payload on rate limit breach
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
    retryAfterMinutes: 15,
  });
};

/**
 * General API Limiter: 200 requests per 15-minute window per IP
 */
export const generalLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler(
        'Too many requests received from this IP address. Please try again after 15 minutes.'
      ),
    });

/**
 * Strict Authentication Limiter: 15 attempts per 15 minutes
 * Mitigates brute-force credential stuffing on /login and /register
 */
export const authLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 15,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler(
        'Too many authentication attempts. For your security, this IP is temporarily throttled. Please try again in 15 minutes.'
      ),
    });

/**
 * Emergency SOS Limiter: 15 triggers per minute per IP
 * Prevents automated denial of service flooding while ensuring legitimate triggers go through
 */
export const sosLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      max: 15,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          message:
            'Too many SOS requests triggered in a short timeframe. Please wait 60 seconds before triggering again.',
        });
      },
    });
