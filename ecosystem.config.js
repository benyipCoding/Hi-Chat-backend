module.exports = {
  apps: [
    {
      name: 'hi_chat',
      script: './dist/main.js',
      // instances: 1,
      // autorestart: true,
      // watch: false,
      // max_memory_restart: '1G',
      env: {
        STAGE: 'prod',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
