import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const velotrabDB = () => {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {

        // Abre ou cria o banco de dados
        const db = await new Promise((resolve, reject) => {
          const database = SQLite.openDatabase(
            { name: 'velotrab.db', location: 'default' },
            () => resolve(database),
            error => reject(error)
          );
        });

        // Criação da tabela dados_user
        await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS dados_user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                cpf TEXT,
                usa_ponto TEXT,
                foto TEXT,
                logo TEXT,
                token TEXT(900)
              )`,
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          });
        });

        // Criação da tabela registros_ponto
        await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS registros_ponto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_hora TEXT,
                data TEXT,
                hora TEXT,
                latitude TEXT,
                longitude TEXT,
                localizacao TEXT,
                status TEXT,
                token TEXT,
                tipo_registro TEXT
              )`,
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          });
        });
        
        return () => {
          db.close(() => console.log('Banco de dados fechado'));
        };
      } catch (error) {
        console.error('Erro detalhado:', error);
      }
    };

    initializeDatabase();
  }, []);

  return null;
};

export default velotrabDB;