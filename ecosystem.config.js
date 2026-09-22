module.exports = {
  apps: [
    {
      name: 'expo-mobile-uno',
      script: 'npx',
      args: 'expo start --host lan',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'development',
        REACT_NATIVE_PACKAGER_HOSTNAME: '2.24.223.151',
        EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK: '1',
      },
    },
  ],
};
