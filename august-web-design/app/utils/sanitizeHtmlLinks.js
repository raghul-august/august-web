/**
 * Sanitizes HTML content by fixing malformed external links.
 * 
 * Problem: Database content may contain href attributes with extra quotes like:
 *   href="\"https://example.com\"" or href=""https://example.com""
 * 
 * This causes browsers to interpret them as relative paths, creating URLs like:
 *   http://localhost:3000/en/%22https:/example.com%22
 * 
 * This utility fixes these malformed links before rendering.
 */

/**
 * Checks if a URL is external (absolute URL with protocol)
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is external
 */
function isExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Remove leading/trailing quotes and whitespace
  const cleanUrl = url.replace(/^["'\s]+|["'\s]+$/g, '');
  
  return (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleanUrl)
  );
}

/**
 * Cleans a potentially malformed href value
 * @param {string} href - The href value to clean
 * @returns {string} - The cleaned href value
 */
function cleanHref(href) {
  if (!href || typeof href !== 'string') return href;
  
  // Remove URL-encoded quotes at start/end (%22 = ")
  let cleaned = href
    .replace(/^%22|%22$/g, '')
    .replace(/^%27|%27$/g, '')
    // Remove literal quotes at start/end
    .replace(/^["'\\]+|["'\\]+$/g, '')
    // Remove escaped quotes
    .replace(/\\"/g, '')
    .replace(/\\'/g, '')
    // Trim whitespace
    .trim();
  
  // If the cleaned URL is external, return it
  if (isExternalUrl(cleaned)) {
    return cleaned;
  }
  
  return href;
}

/**
 * Sanitizes HTML content by fixing malformed href attributes
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML content
 */
export function sanitizeHtmlLinks(html) {
  if (!html || typeof html !== 'string') return html;
  
  // Regex to match href attributes with various quote patterns
  // Matches: href="...", href='...', href=...
  const hrefPattern = /href\s*=\s*["']?([^"'\s>]+(?:["'][^"'\s>]*)?["']?)["']?/gi;
  
  return html.replace(hrefPattern, (match, hrefValue) => {
    const cleanedHref = cleanHref(hrefValue);
    
    // If the href was changed (it was malformed), log it for debugging
    if (cleanedHref !== hrefValue && typeof window !== 'undefined') {
      console.log('[sanitizeHtmlLinks] Fixed malformed href:', {
        original: hrefValue,
        fixed: cleanedHref
      });
    }
    
    return `href="${cleanedHref}"`;
  });
}

/**
 * Alternative: Process HTML and ensure all external links open in new tab
 * with proper security attributes
 * @param {string} html - The HTML content to process
 * @returns {string} - The processed HTML content
 */
export function sanitizeAndSecureHtmlLinks(html) {
  if (!html || typeof html !== 'string') return html;
  
  // First, fix malformed links
  let sanitized = sanitizeHtmlLinks(html);

  // Style TL;DR as a green heading
  sanitized = sanitized.replace(
    /<strong>\s*(TL;?\s*DR:?)\s*<\/strong>/gi,
    '<strong class="tldr-label">$1</strong>'
  );

  // Then, add target="_blank" and rel="noopener noreferrer" to external links
  // Match <a> tags with href containing external URLs
  const anchorPattern = /<a\s+([^>]*href\s*=\s*["']?(https?:\/\/[^"'\s>]+)["']?[^>]*)>/gi;
  
  sanitized = sanitized.replace(anchorPattern, (match, attributes, href) => {
    // Check if target and rel are already present
    const hasTarget = /target\s*=/i.test(attributes);
    const hasRel = /rel\s*=/i.test(attributes);
    
    let newAttributes = attributes;
    
    if (!hasTarget) {
      newAttributes += ' target="_blank"';
    }
    
    if (!hasRel) {
      newAttributes += ' rel="noopener noreferrer"';
    }
    
    return `<a ${newAttributes}>`;
  });
  
  return sanitized;
}

export default sanitizeHtmlLinks;
