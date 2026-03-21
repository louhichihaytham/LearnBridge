const storage = {
  savedSearches: "learnbridge-saved-searches",
  savedPlans: "learnbridge-saved-plans",
  paymentHistory: "learnbridge-payment-history",
  jobTracker: "learnbridge-job-tracker",
};

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function appendItem(key, item, maxItems = 50) {
  const next = [item, ...readList(key)].slice(0, maxItems);
  writeList(key, next);
  return next;
}

export { storage, readList, writeList, appendItem };
