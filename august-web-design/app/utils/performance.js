// Performance monitoring utilities for LCP optimization
const logger = require('./logger');

export const measureLCP = () => {
  if (typeof window === 'undefined') return;

  // Use the Web Vitals API to measure LCP
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    logger.info('LCP:', lastEntry.startTime);
    
    // Send to analytics if needed
    if (window.gtag) {
      window.gtag('event', 'LCP', {
        event_category: 'Web Vitals',
        value: Math.round(lastEntry.startTime),
        non_interaction: true,
      });
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
};

export const measureCLS = () => {
  if (typeof window === 'undefined') return;

  let clsValue = 0;
  let clsEntries = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    }
    
    logger.info('CLS:', clsValue);
    
    if (window.gtag) {
      window.gtag('event', 'CLS', {
        event_category: 'Web Vitals',
        value: Math.round(clsValue * 1000),
        non_interaction: true,
      });
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });
};

export const measureFID = () => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      logger.info('FID:', entry.processingStart - entry.startTime);
      
      if (window.gtag) {
        window.gtag('event', 'FID', {
          event_category: 'Web Vitals',
          value: Math.round(entry.processingStart - entry.startTime),
          non_interaction: true,
        });
      }
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
};

// Initialize all performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Wait for page load to start monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      measureLCP();
      measureCLS();
      measureFID();
    });
  } else {
    measureLCP();
    measureCLS();
    measureFID();
  }
};

// Bundle size analyzer
export const logBundleInfo = () => {
  if (typeof window === 'undefined') return;
  
  // Log performance navigation timing
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    logger.info('Performance Metrics:', {
      'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'TCP Connection': navigation.connectEnd - navigation.connectStart,
      'Request': navigation.responseStart - navigation.requestStart,
      'Response': navigation.responseEnd - navigation.responseStart,
      'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
      'Total Load Time': navigation.loadEventEnd - navigation.navigationStart
    });
  }
  
  // Log resource timing for JavaScript bundles
  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(resource => 
    resource.name.includes('.js') && 
    (resource.name.includes('_next') || resource.name.includes('chunk'))
  );
  
  logger.info('JavaScript Bundle Sizes:', jsResources.map(resource => ({
    name: resource.name.split('/').pop(),
    size: resource.transferSize,
    loadTime: resource.responseEnd - resource.startTime
  })));
};
