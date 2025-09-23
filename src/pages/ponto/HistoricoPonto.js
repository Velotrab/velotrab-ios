import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import getDadosUser from '../../model/ponto/getDadosUser';
import { useNavigation } from '@react-navigation/native';
import { reverse } from 'lodash';
import checkicone from '../../../assets/checkicone.png';

const HistoricoPonto = () => {
  const [dadosPonto, setDadosPonto] = useState(null);
  const dados = getDadosUser();
  const navigation = useNavigation();

  useEffect(() => {
    const listarDados = () => {
      SQLite.openDatabase(
        { name: 'velotrab.db', location: 'default' },
        db => {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM registros_ponto',
              [],
              (tx, results) => {
                const len = results.rows.length;
                const temp = [];
                for (let i = 0; i < len; i++) {
                  const row = results.rows.item(i);
                  temp.push(row);
                }
                setDadosPonto(reverse(temp));
              },
              error => console.error('Erro ao consultar dados:', error)
            );
          });
        },
        // error => console.error('Erro ao abrir o banco de dados:', error)
      );
    };

    listarDados();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.Title}>Registros</Text>
          <View style={styles.lineTitle}></View>

          <ScrollView style={{height: 390, }}>
            {dadosPonto && (
              <View >
                {dadosPonto.map((item, index) => (
                  <View key={index} style={styles.itemContainer}>
                    <View>
                      <Text style={{color: '#6d6d6d', marginBottom: 4, fontWeight: '500', fontSize: 13}}>{item.data}</Text>
                      <Text style={{color: '#6d6d6d', fontWeight: '800', fontSize: 16}}>{item.hora}</Text>
                    </View>
                    <Image source={checkicone} style={{ width: 25, height: 25, borderRadius: 100}}/>  
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  itemContainer: {
    width: 300,
    height: 100,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    color: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 13,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 13,
    borderColor: '#1895ff',
  },
  container: {
    // display: 'flex',
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9fe'
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
    width: 130,
    minWidth: 130,
    maxWidth: 130,
    height: 40,
    flex: 1,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center' 

  },
  img_logo: {
    width: 90,
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
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1895ff',
    borderRadius: 100,
    marginTop: 40,
    width: 140,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600'
  },
});

export default HistoricoPonto;
