export const OPERATOR_STYLES = {
  MTN:      { label: 'MTN Mobile Money', bg: 'bg-yellow-50 border-yellow-400' },
  Orange:   { label: 'Orange Money',     bg: 'bg-orange-50 border-orange-400' },
  Moov:     { label: 'Moov Money',       bg: 'bg-blue-50 border-blue-400' },
  TMoney:   { label: 'TMoney',           bg: 'bg-green-50 border-green-400' },
  Wave:     { label: 'Wave',             bg: 'bg-cyan-50 border-cyan-400' },
  Airtel:   { label: 'Airtel Money',     bg: 'bg-red-50 border-red-400' },
  Vodacom:  { label: 'Vodacom M-Pesa',   bg: 'bg-red-50 border-red-400' },
};

export const COUNTRIES = [
  { code: 'CM', name: 'Cameroun',           flag: '🇨🇲', prefix: '+237', currency: 'XAF', operators: ['MTN', 'Orange'] },
  { code: 'CI', name: "Côte d'Ivoire",      flag: '🇨🇮', prefix: '+225', currency: 'XOF', operators: ['MTN', 'Orange', 'Moov', 'Wave'] },
  { code: 'SN', name: 'Sénégal',            flag: '🇸🇳', prefix: '+221', currency: 'XOF', operators: ['Orange', 'Wave'] },
  { code: 'TG', name: 'Togo',               flag: '🇹🇬', prefix: '+228', currency: 'XOF', operators: ['TMoney', 'Moov'] },
  { code: 'BJ', name: 'Bénin',              flag: '🇧🇯', prefix: '+229', currency: 'XOF', operators: ['MTN', 'Moov'] },
  { code: 'BF', name: 'Burkina Faso',       flag: '🇧🇫', prefix: '+226', currency: 'XOF', operators: ['Orange', 'Moov'] },
  { code: 'ML', name: 'Mali',               flag: '🇲🇱', prefix: '+223', currency: 'XOF', operators: ['Orange', 'Moov'] },
  { code: 'GN', name: 'Guinée',             flag: '🇬🇳', prefix: '+224', currency: 'GNF', operators: ['MTN', 'Orange'] },
  { code: 'GA', name: 'Gabon',              flag: '🇬🇦', prefix: '+241', currency: 'XAF', operators: ['Airtel'] },
  { code: 'CG', name: 'Congo-Brazzaville',  flag: '🇨🇬', prefix: '+242', currency: 'XAF', operators: ['MTN', 'Airtel'] },
  { code: 'CD', name: 'Congo RDC',          flag: '🇨🇩', prefix: '+243', currency: 'CDF', operators: ['Vodacom', 'Airtel', 'Orange'] },
];

export const DEFAULT_COUNTRY_CODE = 'CM';

// backward compat
export const OPERATORS_CM = COUNTRIES.find((c) => c.code === 'CM').operators.map((op) => ({
  value: op,
  label: OPERATOR_STYLES[op].label,
  bg: OPERATOR_STYLES[op].bg,
}));

export const POLL_INTERVAL_MS = 4000;
export const POLL_TIMEOUT_MS = 3 * 60 * 1000;
