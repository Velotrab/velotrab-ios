import React, { useEffect, useState } from 'react';
import SQLite from 'react-native-sqlite-storage';
import axios from 'axios';
import deletarDados from './deletarDados';
import { Alert } from 'react-native';

const enviardadosAPI = async () => {
  try {
    // Abrir o banco de dados SQLite
    const db = await SQLite.openDatabase({ name: 'velotrab.db', location: 'default' });

    // Consultar os registros da tabela "registros_ponto"
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM registros_ponto ORDER BY id',
        [],
        async (tx, results) => {
          const len = results.rows.length;
          const temp = [];
          for (let i = 0; i < len; i++) {
            const row = results.rows.item(i);
            temp.push(row);
          }

          // Enviar os registros para a API
          try {
            const response = await axios.post('https://www.app.velotrab.com.br:444/velotrab-api/ponto/insert/dados', {dados: temp}, {
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (response.data.response) {
              deletarDados('registros_ponto');
            }
          } catch (error) {
            console.error('Erro ao consultar a API:', error);
          }
        },
        error => console.error('Erro ao consultar dados:', error)
      );
    });

  } catch (error) {
    // console.error('Erro ao abrir o banco de dados:', error);
  }
};

export default enviardadosAPI;