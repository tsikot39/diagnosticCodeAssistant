import Constants from 'expo-constants';

export default {
  expo: {
    ...Constants.expoConfig,
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:8000',
      ...Constants.expoConfig?.extra,
    },
  },
};
