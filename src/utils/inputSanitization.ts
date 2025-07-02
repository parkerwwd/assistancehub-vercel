/**
 * Enhanced input sanitization for search queries
 */
export const sanitizeSearchInput = (input: string): string => {
  return input
    .replace(/[<>"']/g, '') // Remove HTML/script injection characters
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .substring(0, 100); // Limit search query length
};