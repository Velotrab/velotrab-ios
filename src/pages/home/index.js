import velotrabDB from "../../model/migrations/createDB"; // OK
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  PermissionsAndroid
} from "react-native";
import { WebView } from "react-native-webview";
import { Alert, StatusBar } from "react-native";
import { Vibration } from "react-native";
import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import iconImage from "../../../assets/alert.png";
import { NetInfo, fetch } from "@react-native-community/netinfo"; // oK
import { View, Image, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; // ok
import dadosAPIPonto from "../../helpers/ponto/dadosAPI"; // ok
import getDadosUser from '../../model/ponto/getDadosUser';
import enviardadosAPI from "../../helpers/ponto/enviarDadosAPI";

import messaging from '@react-native-firebase/messaging'; // Importe o messaging corretamente


export default function Home() {

  const [token_device, setToken_device] = useState();
  const [loading_app, seLloading_app] = useState(null);
  const [tokenFront, setTokenFront] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [UrlParam, setUrlParam] = useState(''); // url
  const webViewRef = useRef();
  const [isLoading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webviewError, setWebviewError] = useState(null); // mudar pra null quando for pra loja
  const loadingTimeoutRef = useRef(null);
  const [getToken, setGetToken] = useState(false);
  const navigation = useNavigation();
  const [refreshNet, setRefreshNet] = useState(false);

  const [barStyle, setBarStyle] = useState('light-content')
  const [barColor, setBarColor] = useState('#0C92BD')

  // Permissão para o push notification
  const requestUserPermission = async () => {
    
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        setToken_device(token);
        seLloading_app(true);
        console.log(token)
      }
    } catch (error) {
      seLloading_app(true);
      console.error("Erro ao solicitar permissão de notificação:", error);
    }
  };

  useEffect(() => {
    requestUserPermission();
  }, []);

  // Criação do banco e requisição para pegar os dados do usuario logado
  velotrabDB();
  dadosAPIPonto(tokenFront);
  const dados_user = getDadosUser();

  // Permissões para Notificações, Camera, Midia e localização
  useEffect(() => {
    async function setupNotificationPermissions() {
      try {
        const settings = await Notifications.getPermissionsAsync();
        if (settings.granted) {
          return true;
        } else {
          Alert.alert(
            "Notificações",
            'Ative as notificações nas configurações para otimizar sua experiência. Clique em "Ok", em seguida, selecione "Notificações" e ative-as.',
            [
              {
                text: "Ok",
                onPress: () => Linking.openSettings(),
              },
              {
                text: "Mais tarde",
                onPress: () => { },
                style: "cancel",
              },
            ]
          );

          return false;
        }
      } catch (error) {
        console.error("Erro ao inicializar as permissões:", error);
      }
    }

    async function setupOtherPermissions() {
      const cameraGranted = await requestPermissionWithExplanation(
        "Camera",
        "Precisamos da permissão da câmera, será usado para você poder tirar fotos de documentos e comprovantes."
      );

      if (cameraGranted) {
        const mediaGranted = await requestPermissionWithExplanation(
          "Media",
          "Precisamos da permissão da biblioteca de mídia, será usado para você subir fotos de documentos e comprovantes de sua galeria."
        );

        if (mediaGranted) {
          const locationGranted = await requestPermissionWithExplanation(
            "Location",
            "Precisamos da permissão para acessar sua localização, será usado para registrar ponto digital e garantir sua segurança da informação."
          );

          if (locationGranted) {
            const notificationPermissionGranted =
              await setupNotificationPermissions();
            if (notificationPermissionGranted) {
            }
          }
        }
      }
    }

    async function initialize() {
      await setupOtherPermissions();
    }

    initialize();
  }, []);

  
  // Biometria
  const authenticateWithBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        webViewRef.current.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: 'Este dispositivo não oferece suporte à autenticação biométrica.' }));`
        );
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        webViewRef.current.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: 'Nenhuma biometria encontrada para este dispositivo.' }));`
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentique-se",
      });
      if (result.success) {
        webViewRef.current.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: 'authenticated' }));`
        );
      } else {
        webViewRef.current.injectJavaScript(
          `window.dispatchEvent(new MessageEvent('message', { data: 'Biometria inválida.' }));`
        );
      }
    } catch (error) {
      console.error("Erro durante autenticação biométrica:", error);
    }
  };

  // Função que valida as permissões enviadas
  async function requestPermissionWithExplanation(permissionType, explanation) {
    let getPermissionFunction;
    let requestPermissionFunction;

    switch (permissionType) {
      case "Camera":
        getPermissionFunction = Camera.getCameraPermissionsAsync;
        requestPermissionFunction = Camera.requestCameraPermissionsAsync;
        break;
      case "Media":
        getPermissionFunction = MediaLibrary.getPermissionsAsync;
        requestPermissionFunction = MediaLibrary.requestPermissionsAsync;
        break;
      case "Location":
        getPermissionFunction = Location.getForegroundPermissionsAsync;
        requestPermissionFunction = Location.requestForegroundPermissionsAsync;
        break;
      default:
        throw new Error("Invalid permission type!");
    }

    const permission = await getPermissionFunction();

    if (permission.status === "granted") return true;

    if (
      permission.status === "undetermined" ||
      permission.status === "denied"
    ) {
      const result = await new Promise((resolve) => {
        Alert.alert(
          "Permissão necessária",
          explanation,
          [
            {
              text: "Ok",
              onPress: async () => {
                const newPermission = await requestPermissionFunction();
                resolve(newPermission.status === "granted");
              },
            },
          ],
          { cancelable: false }
        );
      });

      return result;
    }
    return false;
  }

  // ?
  const handleBackButtonPress = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    }
    return false;
  };

  // Novamente solicita as permissões ?
  useEffect(() => {
    async function setupNotificationPermissions() {
      try {
        const settings = await Notifications.getPermissionsAsync();
        if (settings.granted) {
          return true;
        } else {
          Alert.alert(
            "Notificações",
            'Ative as notificações nas configurações para otimizar sua experiência. Clique em "Ok", em seguida, selecione "Notificações" e ative-as.',
            [
              {
                text: "Ok",
                onPress: () => Linking.openSettings(),
              },
              {
                text: "Mais tarde",
                onPress: () => { },
                style: "cancel",
              },
            ]
          );

          return false;
        }
      } catch (error) {
        console.error("Erro ao inicializar as permissões:", error);
      }
    }

    async function setupOtherPermissions() {
      const cameraGranted = await requestPermissionWithExplanation(
        "Camera",
        "Precisamos da permissão da câmera, será usado para você poder tirar fotos de documentos e comprovantes."
      );

      if (cameraGranted) {
        const mediaGranted = await requestPermissionWithExplanation(
          "Media",
          "Precisamos da permissão da biblioteca de mídia, será usado para você subir fotos de documentos e comprovantes de sua galeria."
        );

        if (mediaGranted) {
          const locationGranted = await requestPermissionWithExplanation(
            "Location",
            "Precisamos da permissão para acessar sua localização, será usado para registrar ponto digital e garantir sua segurança da informação."
          );

          if (locationGranted) {
            const notificationPermissionGranted =
              await setupNotificationPermissions();
            if (notificationPermissionGranted) {
            }
          }
        }
      }
    }

    async function initialize() {
      await setupOtherPermissions();
    }

    initialize();
  }, []);

  // ?
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonPress
      );
    };
  }, [canGoBack]);

  // Acesso e envio ao localstorage
  const INJECTED_JAVASCRIPT = `(function() {
        window.localStorage.setItem('id_device', '${token_device}');
        const tokenLocalStorage = window.localStorage.getItem('authData');
        window.ReactNativeWebView.postMessage(tokenLocalStorage);
      })();`;
  
  // Dispara após fazer o postMessage, guarda o token
  const onMessage = (payload) => {
    try {
      const data = JSON.parse(payload.nativeEvent.data);

      // Se for um objeto com statusBarColor ou barStyle, atualiza a StatusBar
      if (data.statusBarColor || data.barStyle) {
        if (data.statusBarColor) {
          setBarColor(data.statusBarColor)
        }
        if (data.barStyle) {
          setBarStyle(data.barStyle)
        }
      }

      // Se for o comando de autenticação
      if (payload.nativeEvent.data === "requestTouchID") {
        authenticateWithBiometrics();
      } else {
        // Caso contrário, trate como token
        setTokenFront(payload.nativeEvent.data);
        setGetToken(payload.nativeEvent.data);
      }
    } catch (e) {
      // Se não for um JSON, trata normalmente (ex: token puro)
      if (payload.nativeEvent.data === "requestTouchID") {
        authenticateWithBiometrics();
      } else {
        setTokenFront(payload.nativeEvent.data);
        setGetToken(payload.nativeEvent.data);
      }
    }
  };

  // Quando o webview não renderiza
  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;

    // Verifique o código de erro para determinar o tipo de erro
    let errorMessage = "";
    switch (nativeEvent.code) {
      case -1009: // Código de erro para 'sem conexão com a internet'
        errorMessage = "ERRO 09: ";
        break;
      case -1001: // Código de erro para 'tempo de solicitação esgotado'
        errorMessage = "ERRO 01: ";
        break;
      // Adicione mais códigos de erro conforme necessário
      default:
        errorMessage = "ERRO 05: ";
        break;
    }

    errorMessage +=
      " Mas não se preocupe! Confira sua conexão com a internet e clique no botão abaixo que ajudaremos você a voltar em um piscar de olhos.";
    setWebviewError(errorMessage);
    setLoading(false);
  };

  // refresh no webview
  const retryLoading = () => {
    setWebviewError(null);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setRefreshNet(!refreshNet)
  };

  // Com conexão envia os dados para api, sem conexão exibe o ErrorScreen
  useEffect(() => {
    fetch().then((state) => {
      if (state.isConnected) {
        enviardadosAPI();
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    });
  }, [refreshNet]);

  // Quando o webview não renderiza, exibe opção de ponto offline
  const ErrorScreen = ({ onRetry, dados_user }) => {
    return (
      <View style={styles2.errorContainer}>
        <View style={styles2.errorIconContainer}>
          <Image source={iconImage} style={styles2.errorIcon} />
        </View>
        <Text style={styles2.errorTitle}>Ops! Parece que algo deu errado.</Text>
        <Text style={styles2.errorMessage}>
          Mas não se preocupe! Confira sua conexão com a internet e clique no
          botão abaixo que ajudaremos você a voltar em um piscar de olhos.
        </Text>
        <TouchableOpacity onPress={onRetry} style={styles2.retryButton}>
          <Text style={styles2.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
        {dados_user ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("PontoOff")}
            style={styles2.retryButton}
          >
            <Text style={styles2.retryButtonText}>Registrar Ponto</Text>
          </TouchableOpacity>
        ) : (
          ""
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={barStyle} backgroundColor={barColor} />
      {!isConnected || webviewError ? (
        <ErrorScreen onRetry={retryLoading} dados_user={dados_user} />
      ) : (
        <>
        {loading_app && (
          <WebView
            originWhiteList={["*"]}
            source={{ uri: "https://www.app.velotrab.com.br:444" + UrlParam }}
            style={styles.container}
            bounces={false}
            ref={webViewRef}
            javaScriptEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            allow="camera *; microphone *; encrypted-media *"
            // injectedJavaScript={`
            //     window.localStorage.setItem('id_device', '${token_device}');
            // `}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={onMessage}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
              setBarStyle('light-content')
              setBarColor('#0C92BD')
            }}
            onLoadStart={(syntheticEvent) => {
              setLoading(true);
              loadingTimeoutRef.current = setTimeout(() => {
                setLoading(false);
              }, 1000);
            }}
            onShouldStartLoadWithRequest={(event) => {
              return true;
            }}
            onLoadEnd={(syntheticEvent) => {
              setLoading(false);
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
              }
            }}
            onError={handleWebViewError}
            cacheEnabled={true}
          />
        )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles2 = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff", // Ou qualquer outra cor de fundo que você deseja
  },
  errorIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorIcon: {
    width: 192,
    height: 192,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1895FF",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007bff", // Cor do botão, ajuste conforme o design
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: 20,
    fontSize: 20,
    fontWeight: 600,
  },
});
