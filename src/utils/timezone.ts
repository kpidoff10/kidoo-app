/**
 * Utilitaires pour gérer les timezones IANA
 */

const TIMEZONE_OFFSET_TO_IANA: Record<number, string> = {
  0: 'UTC',
  60: 'Europe/Paris',
  120: 'Asia/Dubai',
  180: 'Europe/Istanbul',
  240: 'Asia/Dubai',
  300: 'India/Kolkata',
  330: 'India/Kolkata',
  360: 'Asia/Bangkok',
  420: 'Asia/Singapore',
  480: 'Asia/Shanghai',
  540: 'Asia/Tokyo',
  600: 'Australia/Sydney',
  660: 'Pacific/Auckland',
  720: 'Pacific/Auckland',
  '-300': 'America/New_York',
  '-360': 'America/Chicago',
  '-420': 'America/Denver',
  '-480': 'America/Los_Angeles',
};

export function detectDeviceTimezone(): string {
  try {
    const offsetMinutes = -new Date().getTimezoneOffset();
    if (TIMEZONE_OFFSET_TO_IANA[offsetMinutes]) {
      return TIMEZONE_OFFSET_TO_IANA[offsetMinutes];
    }
    return 'UTC';
  } catch (error) {
    console.error('Erreur détection timezone:', error);
    return 'UTC';
  }
}

export const SUPPORTED_TIMEZONES = [
  { id: 'UTC', label: 'UTC / GMT' },
  { id: 'Europe/Paris', label: 'France (Paris)' },
  { id: 'Europe/London', label: 'United Kingdom (London)' },
  { id: 'Europe/Berlin', label: 'Germany (Berlin)' },
  { id: 'Europe/Amsterdam', label: 'Netherlands (Amsterdam)' },
  { id: 'America/New_York', label: 'USA (New York - EST)' },
  { id: 'America/Chicago', label: 'USA (Chicago - CST)' },
  { id: 'America/Denver', label: 'USA (Denver - MST)' },
  { id: 'America/Los_Angeles', label: 'USA (Los Angeles - PST)' },
  { id: 'America/Toronto', label: 'Canada (Toronto - EST)' },
  { id: 'America/Mexico_City', label: 'Mexico (Mexico City)' },
  { id: 'America/Sao_Paulo', label: 'Brazil (São Paulo)' },
  { id: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { id: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Bangkok', label: 'Thailand (Bangkok)' },
  { id: 'India/Kolkata', label: 'India (Kolkata)' },
  { id: 'Asia/Dubai', label: 'United Arab Emirates (Dubai)' },
  { id: 'Asia/Istanbul', label: 'Turkey (Istanbul)' },
  { id: 'Australia/Sydney', label: 'Australia (Sydney)' },
  { id: 'Australia/Melbourne', label: 'Australia (Melbourne)' },
  { id: 'Pacific/Auckland', label: 'New Zealand (Auckland)' },
  { id: 'Africa/Cairo', label: 'Egypt (Cairo)' },
  { id: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
  { id: 'Africa/Lagos', label: 'Nigeria (Lagos)' },
];
