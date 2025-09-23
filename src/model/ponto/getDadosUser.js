import React, { useEffect, useState } from 'react';
import SQLite from 'react-native-sqlite-storage';

const getDadosUser = () => {
  const [lastData, setLastData] = useState(null);

  useEffect(() => {
    const db = SQLite.openDatabase(
      { name: 'velotrab.db', location: 'default' },
      () => {},
      error => {
        // console.error('Erro ao abrir o banco de dados:', error);
      }
    );

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM dados_user ORDER BY id DESC LIMIT 1',
        [],
        (tx, results) => {
          const rows = results.rows;
          if (rows.length > 0) {
            const lastRow = rows.item(0);
            setLastData(lastRow);
          } else {
            setLastData(null);
          }
        },
        error => {
          console.error('Erro ao selecionar dados:', error);
        }
      );
    });
  }, []);

  return lastData;
};

export default getDadosUser;