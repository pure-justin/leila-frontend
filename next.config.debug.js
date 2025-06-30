
const originalConfig = require('./next.config.js');

module.exports = {
  ...originalConfig,
  webpack: (config, { dev, isServer }) => {
    // Log webpack stats
    console.log('📊 Webpack Config Analysis:', {
      mode: config.mode,
      target: config.target,
      entrypoints: Object.keys(config.entry || {}),
      isServer,
      isDev: dev
    });
    
    // Add memory monitoring
    const originalBuild = config.plugins?.find(p => p.constructor.name === 'DefinePlugin');
    
    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('MemoryMonitor', () => {
          const mem = process.memoryUsage();
          console.log(`🧠 Pre-compile Memory: ${Math.round(mem.heapUsed/1024/1024)}MB`);
        });
        
        compiler.hooks.afterCompile.tap('MemoryMonitor', () => {
          const mem = process.memoryUsage();
          console.log(`🧠 Post-compile Memory: ${Math.round(mem.heapUsed/1024/1024)}MB`);
        });
      }
    });
    
    // Call original webpack config if it exists
    if (originalConfig.webpack) {
      return originalConfig.webpack(config, { dev, isServer });
    }
    
    return config;
  }
};
