module.exports = {
  apps: [
    {
      name: 'expo-mobile-uno',
      script: 'npx',
      args: 'expo start --public',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'development',
        EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK: '1',
      },
    },
  ],
};
