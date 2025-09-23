import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import moment from 'moment';
import SQLite from 'react-native-sqlite-storage';
import * as Location from 'expo-location';
import getDadosUser from '../../model/ponto/getDadosUser'; // ok
import iconImage from '../../../assets/ticket.png';
import checkicone from '../../../assets/checkicone.png';
import closeModal from '../../../assets/closeModal.png';
import { useNavigation } from '@react-navigation/native'
import insertDadosPonto from '../../model/ponto/insertDadosPonto'; // ok

const PontoOff = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDateTime, setCurrentDateTime] = useState('');

  const [dataHoraPonto, setdataHoraPonto] = useState('');
  const [dataPonto, setdataPonto] = useState('');
  const [dataHora, setdataHora] = useState('');



  const [modal, setModal] = useState();

  // Pego a latitude e longitude
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigation = useNavigation();
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão para acessar a localização foi negada.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // deletarDados('registros_ponto')

  let latitude = null;
  let longitude = null;
  if (location) {
    latitude = location.coords.latitude;
    longitude = location.coords.longitude;
  }



  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      const nowData = moment().format('DD/MM/YYYY');
      const nowHora = moment().format('HH:mm:ss');
      setCurrentDateTime(now);
      setdataPonto(nowData);
      setdataHora(nowHora);
    }, 1000); // Atualiza a cada segundo

    return () => clearInterval(interval);
  }, []);


  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('pt-BR', options);
  };

  const formatTime = (time) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };


  const dados = getDadosUser();

  function Navi(navigation) { // fecha o modal
    navigation.navigate('HistoricoPonto')
    setModal(false)
  }

  function RegistrarPonto(dados) { // registra o ponto localmente
    insertDadosPonto(dados)
    setModal(true)
  }


  return (
    <SafeAreaView style={styles.safeArea}>

    {modal ? 
    <View style={styles.modal_ponto}>
      <View style={styles.ticket_ponto}>
        <TouchableOpacity onPress={() => Navi(navigation)} style={{ right: 0, top: -60, position: 'absolute'}}>
          <Image source={closeModal} style={{ width: 50, height: 50, borderRadius: 100}}/>          
        </TouchableOpacity> 

        <Image source={iconImage} style={styles.ticketIMG} />
        <View style={styles.logo_ticket}>
          <View style={styles.logo_ticket_c}>
            {dados ?  
                <Image
                  source={{ uri: `data:image/jpeg;base64,${dados.logo}` }}
                  style={styles.img_logo_ticket}
                />
            : ''}            
          </View>
        </View>
        <Text style={styles.t_ticket}>Comprovante de Registro de Ponto</Text>
        <Text style={styles.u_ticket}>{dados ? dados.nome : ''} - {dados ? dados.cpf : ''}</Text>
        <Text style={styles.u_ticket}>***************************</Text>
          <Image source={checkicone} style={{ width: 50, height: 50, borderRadius: 100 }}/>
        <Text style={styles.t2_ticket}>Sua marcação foi registrada {'\n'} com sucesso!</Text>
        <Text style={styles.u_ticket}>***************************</Text>
        <Text style={styles.t4_ticket}>{formatDate(currentTime)}</Text>
        <Text style={styles.t5_ticket}>{dataHoraPonto}</Text>
        <Text style={styles.u_ticket}>***************************</Text>
      </View>
    </View>
    : ''}

    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.user_header}>
          <View style={styles.avatar}>
          {dados ?  
            <Image
              source={{ uri: `data:image/jpeg;base64,${dados.foto}` }}
              style={{ width: 50, height: 50, borderRadius: 100 }}
            />
          : ''}
          </View>
          <View style={styles.user_name}>
            <Text style={styles.user_name_1}>Olá,</Text>
            <Text style={styles.user_name_2}>{dados ? dados.nome : ''}</Text>            
          </View>

        </View>
        {/*<View style={styles.logo}>
          {dados ?  
              <Image
                source={{ uri: `data:image/jpeg;base64,${dados.logo}` }}
                style={styles.img_logo}
              />
            : ''}
        </View>*/}
      </View>
      <View style={styles.body}>
        <Text style={styles.Title}>Registrar Ponto</Text>
        <View style={styles.lineTitle}></View>
        <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
        <TouchableOpacity 
          style={[styles.button, styles.pulse]} 
          onPress={() => {
            const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            const dataPonto = moment().format('DD/MM/YYYY');
            const dataHora = moment().format('HH:mm:ss');
            
            setdataHoraPonto(dataHora); // Atualiza a hora ao clicar
            
            RegistrarPonto({
              data_hora: currentDateTime,
              data: dataPonto,
              hora: dataHora,
              latitude: latitude,
              longitude: longitude,
              localizacao: 'local',
              status: 'não enviado',
              token: dados ? dados.token : '',
              tipo_registro: 'offline'
            })
          }}
        >
          <Text style={styles.buttonText} >REGISTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('HistoricoPonto')} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Histórico</Text>
        </TouchableOpacity>   
        {/* <TouchableOpacity style={[styles.button2, styles.pulse]} onPress={() => RegistrarPonto({
        })}>
          <Text style={styles.buttonText2} >Histórico de Ponto</Text>
        </TouchableOpacity> */}
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  retryButton: {
    marginTop: 45,
    backgroundColor: '#1895ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 25
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  container: {
    // display: 'flex',
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff'
    },
  header: {
    backgroundColor: '#1895ff',
    height: 90,
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    width: 110,
    minWidth: 110,
    maxWidth: 110,
    height: 40,
    flex: 1,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center' 

  },
  img_logo: {
    width: 75,
    height: 30,
    resizeMode: 'contain',
    
  },
  user_header: {
    width: 210,
    height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#fff',
    display: 'flex',
    overflow: 'hidden'
  },
  user_name: {
    marginLeft: 10,
  },
  user_name_1: {
    color: '#fff',
    fontSize: 10
  },
  user_name_2: {
    color: '#fff',
    fontSize: 10
  },
  body: {
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  Title: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1895ff',
    marginTop: 30,
    marginBottom: 7,
    
  },
  lineTitle: {
    width: 120,
    height: 3,
    backgroundColor: '#1895ff',
    marginBottom: 80,
  },
  currentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28383b',
    marginBottom: 11
  },
  currentTime: {
    fontSize: 40,
    fontWeight: '600',
    color: '#28383b'
  },
  button: {
    backgroundColor: '#1895ff',
    borderRadius: 100,
    marginTop: 40,
    width: 140,
    height: 140,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button2: {
    backgroundColor: '#1895ff',
    borderRadius: 10,
    marginTop: 30,
    width: '90%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  buttonText2: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500'
  },
  pulse: {
    animationName: 'pulse',
    animationDuration: '1.5s',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
  },
  "@keyframes pulse": {
    '0%': { transform: [{ scale: 1 }] },
    '50%': { transform: [{ scale: 1.2 }] },
    '100%': { transform: [{ scale: 1 }] },
  },


  modal_ponto: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Opacidade de 0.5 // Opacidade de 0.5
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ticket_ponto: {
    width: 340,
    height: 440,
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  ticketIMG: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute'
  },
  logo_ticket: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    position: 'relative',
    top: 20,
  },
  logo_ticket_c: {
    width: 130,
    height: 50,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100
  },
  img_logo_ticket: {
    width: 90,
    height: 30,
    resizeMode: 'contain',
  },
  t_ticket: {
    fontSize: 15,
    marginTop: 30,
    color: '#707070',
    textAlign: 'center',
    fontWeight: '800'
  }, u_ticket: {
    fontSize: 14,
    marginTop: 10,
    color: '#707070',
    textAlign: 'center',
    fontWeight: '400'
  },
  t2_ticket: {
    fontSize: 14,
    marginTop: 10,
    color: '#707070',
    textAlign: 'center',
    fontWeight: '800'
  },
  t4_ticket: {
    fontSize: 15,
    marginTop: 10,
    color: '#707070',
    textAlign: 'center',
    fontWeight: '800'
  },
  t5_ticket: {
    fontSize: 29,
    marginTop: 10,
    color: '#707070',
    textAlign: 'center',
    fontWeight: '800'
  }

});

export default PontoOff;
