import React, { useEffect, useState } from 'react';
import SQLite from 'react-native-sqlite-storage';
import axios from 'axios';
import DadosUser from '../../model/ponto/insertDadosUser';
import { Alert } from 'react-native';


const dadosAPIPonto = async(tokenFront) => {
  const [lastData, setLastData] = useState(null);

  if(tokenFront) {
    try {
      const token = tokenFront;
      const response = await axios.get('https://www.app.velotrab.com.br:444/velotrab-api/ponto/get/dados', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // setData(response.data);

      if(response.data){
        DadosUser(response.data, token)
      }
      
    } catch (error) {
      // console.error('Erro ao consultar a API:', error);
    }

    return lastData;    
  }

};

export default dadosAPIPonto;
