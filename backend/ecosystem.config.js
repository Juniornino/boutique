// ecosystem.config.js
module.exports = {
  apps: [{
    name:      'licensekeys-api',
    script:    'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: { NODE_ENV: 'production' },
  }]
};