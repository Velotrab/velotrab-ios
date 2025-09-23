import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, Linking } from 'react-native';
import Routes from './src/routes/routes';

export default function App() {
  const navigationRef = useRef();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      const route = url.replace(/.*?:\/\//g, '');
      const [screen, ...rest] = route.split('/');

      if (screen === 'velotrab') {
        const qrcodePath = rest.join('/');
        if (navigationRef.current) {
          navigationRef.current.navigate('Home', { qrcode: qrcodePath });
        }
      }
    };

    const checkDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    checkDeepLink();

    // Usando o novo método de listener
    const linkingListener = Linking.addListener('url', handleDeepLink);

    return () => {
      // Remove o listener corretamente
      linkingListener.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Routes />
    </NavigationContainer>
  );
}