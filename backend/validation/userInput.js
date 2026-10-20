const STRING_FIELDS = {
  fullName: { required: true, maxLength: 100 },
  email: { required: true, maxLength: 254 },
  phoneNumber: { maxLength: 30 },
  gender: { maxLength: 50 },
  profileImageUrl: { maxLength: 2048, url: true },
  jobTitle: { maxLength: 100 },
  department: { maxLength: 100 },
  city: { maxLength: 100 },
  country: { maxLength: 100 },
  address: { maxLength: 300 },
  bio: { maxLength: 500 },
};

const ENUM_FIELDS = {
  status: ['Active', 'Inactive', 'Pending'],
  role: ['User', 'Admin', 'Manager'],
};

function validateUserInput(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const allowedFields = new Set([...Object.keys(STRING_FIELDS), 'age', ...Object.keys(ENUM_FIELDS)]);
  const unknownField = Object.keys(body).find((field) => !allowedFields.has(field));
  if (unknownField) {
    return { error: `Unknown user field: ${unknownField}.` };
  }

  const value = {};
  for (const [field, rules] of Object.entries(STRING_FIELDS)) {
    if (!Object.hasOwn(body, field)) {
      if (!partial && rules.required) return { error: `${field} is required.` };
      continue;
    }

    const fieldValue = body[field];
    if (typeof fieldValue !== 'string') {
      return { error: `${field} must be a string.` };
    }

    const normalized = fieldValue.trim();
    if (rules.required && !normalized) return { error: `${field} is required.` };
    if (normalized.length > rules.maxLength) {
      return { error: `${field} must be ${rules.maxLength} characters or fewer.` };
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { error: 'Email must be a valid email address.' };
    }
    if (rules.url && normalized) {
      try {
        const parsed = new URL(normalized);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid URL protocol');
      } catch {
        return { error: 'profileImageUrl must be a valid HTTP or HTTPS URL.' };
      }
    }
    value[field] = field === 'email' ? normalized.toLowerCase() : normalized;
  }

  if (Object.hasOwn(body, 'age')) {
    const age = body.age;
    if (age === null) {
      value.age = null;
    } else if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 120) {
      return { error: 'age must be a whole number between 1 and 120.' };
    } else {
      value.age = age;
    }
  }

  for (const [field, options] of Object.entries(ENUM_FIELDS)) {
    if (!Object.hasOwn(body, field)) continue;
    if (!options.includes(body[field])) {
      return { error: `${field} must be one of: ${options.join(', ')}.` };
    }
    value[field] = body[field];
  }

  if (partial && Object.keys(value).length === 0) {
    return { error: 'Provide at least one user field to update.' };
  }

  return { value };
}

module.exports = { validateUserInput };
