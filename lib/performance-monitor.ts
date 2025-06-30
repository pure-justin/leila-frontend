// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  measureComponent(componentName: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    
    this.metrics.get(componentName)!.push(end - start);
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && end - start > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${(end - start).toFixed(2)}ms`);
    }
  }
  
  getReport() {
    const report: Record<string, any> = {};
    
    this.metrics.forEach((times, component) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      report[component] = {
        renders: times.length,
        avgTime: avg.toFixed(2) + 'ms',
        maxTime: max.toFixed(2) + 'ms',
        minTime: min.toFixed(2) + 'ms',
      };
    });
    
    return report;
  }
  
  reset() {
    this.metrics.clear();
  }
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measure: (fn: () => void) => monitor.measureComponent(componentName, fn),
    report: () => monitor.getReport(),
  };
}