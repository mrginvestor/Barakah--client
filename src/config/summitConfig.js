/**
 * Central Summit Event and UPI Payment Configuration (Frontend)
 *
 * Configurable parameters for the Halal Wealth Summit.
 */

export const SUMMIT_CONFIG = {
  eventName: 'Halal Wealth Summit',
  subtitle: 'Register now to reserve your seat. Limited to 50 participants.',
  maxCapacity: 50,
  registrationFee: 500,
  currency: 'INR',
  currencySymbol: '₹',

  // Reservation hold duration
  reservationTimeoutMinutes: 30,

  // UPI Configuration Placeholders
  upiId: import.meta.env.VITE_SUMMIT_UPI_ID || 'YOUR_UPI_ID',
  accountHolderName: import.meta.env.VITE_SUMMIT_ACCOUNT_HOLDER_NAME || 'YOUR_ACCOUNT_NAME',
  upiQrCode: import.meta.env.VITE_SUMMIT_UPI_QR_CODE || '',

  // Upload limits
  maxScreenshotSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
};
