
export function extractSlugFromHref(href) {
    if (!href) return '';
    // Extract the last part of the URL after the last slash
    const parts = href.split('/');
    return parts[parts.length - 1] || '';
  }
  
export function getNextFiveBlogs(list, currentSlug, count = 5) {
    if (!Array.isArray(list) || list.length === 0) return [];
    
    // Normalize the current slug for comparison
    const normalizedCurrentSlug = (currentSlug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
    
    // Debug log the first few items to see their structure
    console.log('First few featured blogs:', list.slice(0, 3).map(b => ({
      id: b.id,
      slug: b.slug,
      href: b.href,
      title: b.title,
      extractedSlug: extractSlugFromHref(b.href)
    })));
    
    // Try to find the current blog post in the list
    let idx = list.findIndex(item => {
      // Try to get slug from href first, then from slug property
      const itemHref = item.href || '';
      const itemSlug = extractSlugFromHref(itemHref) || item.slug || '';
      const normalizedItemSlug = itemSlug.replace(/^\/+|\/+$/g, '').toLowerCase();
      
      return normalizedItemSlug === normalizedCurrentSlug || 
             item.id === currentSlug || 
             item.id === normalizedCurrentSlug;
    });
    
    console.log('Found current blog at index:', idx, 'for slug:', currentSlug);
    
    // If current blog not found, start from the beginning
    if (idx === -1) {
      console.log('Current blog not found in featured blogs, starting from beginning');
      idx = 0;
    }
    
    const result = [];
    const take = Math.min(count, list.length);
    
    // Get the next 'take' blogs, wrapping around if needed
    for (let i = 1; i <= take; i++) {
      const nextIndex = (idx + i) % list.length;
      const blog = list[nextIndex];
      
      // Ensure each recommendation has the required fields
      const slug = extractSlugFromHref(blog.href) || blog.slug || '';
      const href = blog.href || `/en/articles/${slug}`;
      
      result.push({
        ...blog,
        slug,
        href
      });
    }
    
    console.log('Selected recommendations:', result.map(r => ({
      title: r.title,
      slug: r.slug,
      href: r.href
    })));
    
    return result;
  }