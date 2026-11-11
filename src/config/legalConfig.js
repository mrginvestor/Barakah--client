/**
 * Central Legal & Compliance Configuration for Halal Wealth
 * Website: https://halalwealth.finance
 *
 * This file centralizes all business identity, contact, policy dates,
 * and compliance parameters required for Indian Payment Gateway verification
 * (Razorpay, Cashfree, PayU, etc.) and statutory disclosures under the
 * Information Technology Act, 2000 and Digital Personal Data Protection Act, 2023.
 */

export const LEGAL_CONFIG = {
  // Brand & Business Details
  brandName: 'Halal Wealth',
  registeredBusinessName: 'Halal Wealth', // Administrator note: Confirm if registered under a specific legal entity (e.g., LLP / Pvt Ltd / Sole Proprietorship)
  websiteUrl: 'https://halalwealth.finance',
  canonicalUrl: 'https://halalwealth.finance',

  // Business Activities & Purpose
  businessActivity: [
    'Islamic finance education and financial literacy',
    'Halal investment awareness and ethical wealth management',
    'Summit and educational webinar organisation',
    'Capacity-building workshops and networking conferences',
  ],

  // Contact Channels
  contactEmail: 'info@halalwealth.finance',
  supportEmail: 'info@halalwealth.finance',
  billingEmail: 'info@halalwealth.finance',
  grievanceEmail: 'info@halalwealth.finance',
  contactPhone: '+91 97906 55520',
  contactPhoneFormatted: '+91 97906 55520',
  whatsappNumber: '919790655520',

  // Registered Office & Jurisdiction
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  registeredAddress: 'Chennai, Tamil Nadu, India',
  fullRegisteredAddress: 'Chennai, Tamil Nadu, India', // Administrator note: Add complete street/premises address when finalized
  governingState: 'Tamil Nadu',
  jurisdictionCity: 'Chennai, Tamil Nadu, India',

  // Grievance Officer (Mandatory under IT Act & DPDP Act 2023)
  grievanceOfficer: {
    title: 'Grievance Officer',
    organization: 'Halal Wealth',
    email: 'info@halalwealth.finance',
    phone: '+91 97906 55520',
    address: 'Chennai, Tamil Nadu, India',
    responseTimeline: 'Within 30 calendar days (or statutory turnaround time)',
  },

  // Policy & Operational Dates
  effectiveDate: 'November 11, 2026',
  lastUpdated: 'November 11, 2026',

  // Refund & Cancellation Policy Parameters (Configurable)
  refundPolicy: {
    // Standard processing window by banks/gateways
    processingTimeline: '5–10 business days',
    // Window within which a participant may request refund if an event is rescheduled/postponed
    postponementRefundWindow: '7 calendar days from the date of the postponement announcement',
    // Missing business decision: Voluntary cancellation window (flagged for admin confirmation)
    voluntaryCancellationWindow: 'As displayed on the registration / checkout page prior to payment',
    // Missing business decision: Cancellation administrative processing fee (if any)
    cancellationFeeNotice: 'Subject to specific event terms published during registration',
    // Duplicate payment refund guarantee
    duplicatePaymentTimeline: 'Within 5–7 business days upon transaction verification',
  },

  // Payment Gateway Disclosure
  paymentGatewayNote:
    'All summit and event registration payments are securely processed through RBI-authorized third-party payment gateways conforming to PCI-DSS standards. Halal Wealth does not directly collect, handle, or store debit/credit card numbers, CVVs, net banking credentials, or UPI PINs.',

  // Financial & Religious Advice Disclaimer
  educationalDisclaimer:
    'Halal Wealth is an educational initiative dedicated to Islamic finance awareness and financial literacy. We do not provide personalized financial, investment, legal, tax, or Shariah advisory services. We do not guarantee investment returns. All attendees are advised to seek independent advice from licensed professionals before making financial decisions.',
};

export default LEGAL_CONFIG;

