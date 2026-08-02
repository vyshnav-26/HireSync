// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 chars)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Name validation (min 2 chars, no numbers)
export const validateName = (name: string): boolean => {
  return name.length >= 2 && !/\d/.test(name);
};

// Job title validation
export const validateJobTitle = (title: string): boolean => {
  return title.length >= 3 && title.length <= 100;
};

// Job description validation
export const validateJobDescription = (description: string): boolean => {
  return description.length >= 20 && description.length <= 5000;
};

// Location validation
export const validateLocation = (location: string): boolean => {
  return location.length >= 2 && location.length <= 100;
};

// Skill validation
export const validateSkill = (skill: string): boolean => {
  return skill.length >= 1 && skill.length <= 50;
};

// Validate job requirements array
export const validateRequirements = (requirements: string[]): boolean => {
  return Array.isArray(requirements) && requirements.length > 0 && requirements.every(r => r.length > 0);
};

// Rating validation (1-5)
export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

// Salary validation
export const validateSalary = (min: number, max: number): boolean => {
  return min > 0 && max > 0 && min <= max;
};

// Combined login validation
export const validateLoginForm = (email: string, password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Combined register validation
export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  company?: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateName(name)) {
    errors.push('Name must be at least 2 characters and contain no numbers');
  }
  
  if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (company && !validateLocation(company)) {
    errors.push('Company name must be between 2-100 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Combined job validation
export const validateJobForm = (
  title: string,
  description: string,
  location: string,
  requirements: string[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateJobTitle(title)) {
    errors.push('Job title must be between 3-100 characters');
  }
  
  if (!validateJobDescription(description)) {
    errors.push('Job description must be between 20-5000 characters');
  }
  
  if (!validateLocation(location)) {
    errors.push('Location must be between 2-100 characters');
  }
  
  if (!validateRequirements(requirements)) {
    errors.push('At least one requirement is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
