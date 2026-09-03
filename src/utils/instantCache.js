// Dynamic Data & Cache Engine for LuxeStay Pro
// All data is dynamically loaded from the server & MongoDB database. No hardcoded default/demo data.

export const BASELINE_HOTELS = [];
export const BASELINE_ROOMS = [];
export const BASELINE_BOOKINGS = [];
export const BASELINE_DESTINATIONS = [];
export const BASELINE_MESSAGES = [];

const BASELINES = {
  hotels: BASELINE_HOTELS,
  manager_hotels: BASELINE_HOTELS,
  rooms: BASELINE_ROOMS,
  manager_rooms: BASELINE_ROOMS,
  bookings: BASELINE_BOOKINGS,
  manager_bookings: BASELINE_BOOKINGS,
  customer_bookings: BASELINE_BOOKINGS,
  destinations: BASELINE_DESTINATIONS,
  messages: BASELINE_MESSAGES
};

/**
 * Returns instant cached data from localStorage if available, otherwise returns fallback.
 * Strictly avoids injecting any hardcoded default data.
 */
export const getInstantData = (key, fallback = null) => {
  try {
    const cached = localStorage.getItem(`luxestay_cache_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      } else if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return fallback !== null ? fallback : [];
};

/**
 * Smart Partner Filter: filters items strictly belonging to the authenticated manager.
 * Returns only real matched items without any fake fallback.
 */
export const filterPartnerItems = (items, user) => {
  if (!items || !Array.isArray(items)) return [];
  if (!user) return [];
  if (user.role === 'admin') return items;

  const uId = user.id ? String(user.id).toLowerCase() : '';
  const uEmail = user.email ? user.email.toLowerCase() : '';
  const uName = user.name ? user.name.toLowerCase() : '';
  const uCompany = user.companyName ? user.companyName.toLowerCase() : '';

  return items.filter(item => {
    const pId = item.partnerId ? String(item.partnerId).toLowerCase() : '';
    const pEmail = item.partnerEmail ? String(item.partnerEmail).toLowerCase() : '';
    const pName = item.partnerName ? String(item.partnerName).toLowerCase() : '';

    if (uId && pId && (pId === uId || pId.includes(uId) || uId.includes(pId))) return true;
    if (uEmail && pEmail && pEmail === uEmail) return true;
    if (uName && pName && (pName === uName || pName.includes(uName) || uName.includes(pName))) return true;
    if (uCompany && pName && (pName === uCompany || pName.includes(uCompany))) return true;
    if (uEmail && pName && pName === uEmail.split('@')[0]) return true;
    return false;
  });
};

/**
 * Fetches fresh server data and updates state & persistent cache.
 */
export const fetchInstantData = (url, key, setter, onComplete) => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && (Array.isArray(data) ? data.length >= 0 : typeof data === 'object')) {
        setter(data);
        try {
          localStorage.setItem(`luxestay_cache_${key}`, JSON.stringify(data));
        } catch (e) {}
      }
      if (onComplete) onComplete(data);
    })
    .catch((err) => {
      if (onComplete) onComplete(null, err);
    });
};
