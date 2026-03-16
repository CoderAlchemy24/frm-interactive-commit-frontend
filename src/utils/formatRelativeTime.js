function pluralize(value, unit) {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

function normalizeLegacyAgoString(value) {
  const compactAgoPattern = /^(\d+)([a-zA-Z]+)\s+ago$/;
  const match = value.match(compactAgoPattern);

  if (!match) {
    return value;
  }

  return `${match[1]} ${match[2]} ago`;
}

export function formatRelativeTime(createdAt) {
  if (typeof createdAt !== 'string' || !createdAt.trim()) {
    return '';
  }

  const rawValue = createdAt.trim();

  // Keep existing static data like "1 month ago" intact, while normalizing compact variants.
  if (/\bago$/i.test(rawValue)) {
    return normalizeLegacyAgoString(rawValue);
  }

  const timestamp = Date.parse(rawValue);

  if (Number.isNaN(timestamp)) {
    return rawValue;
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (elapsedSeconds < 60) {
    return 'just now';
  }

  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 }
  ];

  for (const unit of units) {
    if (elapsedSeconds >= unit.seconds) {
      const value = Math.floor(elapsedSeconds / unit.seconds);
      return pluralize(value, unit.name);
    }
  }

  return 'just now';
}
