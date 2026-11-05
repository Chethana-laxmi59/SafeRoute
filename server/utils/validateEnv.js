/**
 * Environment Variable Validation Utility
 * Validates critical environment variables at startup to prevent runtime misconfigurations.
 */
export const validateEnv = () => {
  const issues = [];
  const warnings = [];

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    warnings.push(
      'Neither MONGODB_URI nor MONGO_URI is set. Defaulting to local: mongodb://127.0.0.1:27017/saferoute'
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (process.env.NODE_ENV === 'production') {
      issues.push('CRITICAL: JWT_SECRET environment variable is missing in production mode!');
    } else {
      warnings.push(
        'JWT_SECRET is not set. Using fallback development secret. Set JWT_SECRET in server/.env for production.'
      );
    }
  } else if (
    process.env.NODE_ENV === 'production' &&
    jwtSecret.includes('saferoute_dev_secret_key')
  ) {
    issues.push(
      'CRITICAL: Production deployment is using the default development JWT_SECRET! Please configure a cryptographically secure random secret.'
    );
  }

  const clientUrl = process.env.CLIENT_URL;
  if (process.env.NODE_ENV === 'production' && !clientUrl) {
    warnings.push(
      'CLIENT_URL is not set in production. CORS will allow requests only from default or local origins.'
    );
  }

  // Print warnings and errors cleanly
  if (warnings.length > 0) {
    console.warn('\n[Environment Warnings]');
    warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
  }

  if (issues.length > 0) {
    console.error('\n[Environment Errors]');
    issues.forEach((i) => console.error(`  ✗ ${i}`));
    console.error('Halting startup due to critical security environment validation failures.\n');
    process.exit(1);
  }

  console.log('[Environment] Configuration validated successfully.');
};

export default validateEnv;

