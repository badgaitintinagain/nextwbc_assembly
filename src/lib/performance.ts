/**
 * Performance utilities สำหรับปรับปรุงประสิทธิภาพ
 */

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = src;
          target.onload = () => {
            target.classList.add('loaded');
          };
          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  observer.observe(img);
  return observer;
};

/**
 * Preload critical images
 */
export const preloadImages = (imageSources: string[]) => {
  imageSources.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

/**
 * Optimize image loading with progressive enhancement
 */
export const createProgressiveImage = (
  container: HTMLElement,
  lowResSrc: string,
  highResSrc: string,
  alt: string = ''
) => {
  // Create low-res placeholder
  const placeholder = document.createElement('img');
  placeholder.src = lowResSrc;
  placeholder.alt = alt;
  placeholder.className = 'progressive-placeholder';
  
  // Create high-res image
  const highResImg = new Image();
  highResImg.onload = () => {
    highResImg.className = 'progressive-image loaded';
    container.appendChild(highResImg);
    
    // Remove placeholder after transition
    setTimeout(() => {
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    }, 300);
  };
  
  container.appendChild(placeholder);
  
  // Start loading high-res image
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        highResImg.src = highResSrc;
        highResImg.alt = alt;
        observer.unobserve(container);
      }
    });
  });
  
  observer.observe(container);
};

/**
 * Basic performance tracking without external dependencies
 */
export const trackBasicPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      
      // DOM Content Loaded
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      
      // Load Complete
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Total Load Time (using fetchStart as baseline)
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      
      // DNS Lookup Time
      dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
      
      // Connection Time
      connectionTime: navigation.connectEnd - navigation.connectStart,
    };
    
    console.log('[Performance Metrics]', metrics);
    return metrics;
  }
  return null;
};

/**
 * Custom Web Vitals tracking (basic implementation)
 */
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Track Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[LCP]', lastEntry.startTime);
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Fallback for older browsers
      console.log('LCP tracking not supported');
    }
    
    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const perfEntry = entry as any;
        if (perfEntry.processingStart) {
          const fid = perfEntry.processingStart - entry.startTime;
          console.log('[FID]', fid);
        }
      }
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('FID tracking not supported');
    }
    
    // Track Cumulative Layout Shift (CLS) - basic version
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as any;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      }
      console.log('[CLS]', clsValue);
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('CLS tracking not supported');
    }
  }
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSMemory: Math.round(memory.usedJSMemory / 1048576), // MB
      totalJSMemory: Math.round(memory.totalJSMemory / 1048576), // MB
      jsMemoryLimit: Math.round(memory.jsMemoryLimit / 1048576), // MB
    };
  }
  return null;
};

/**
 * Bundle size analyzer helper
 */
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available with: npm run analyze');
  }
};

/**
 * Resource timing helper
 */
export const getResourceTiming = () => {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource');
    const largeResources = resources
      .filter((resource: any) => resource.transferSize > 100000) // > 100KB
      .sort((a: any, b: any) => b.transferSize - a.transferSize);
    
    console.table(largeResources.map((resource: any) => ({
      name: resource.name.split('/').pop(),
      size: `${Math.round(resource.transferSize / 1024)}KB`,
      duration: `${Math.round(resource.duration)}ms`,
      type: resource.initiatorType
    })));
  }
};
