import SQLite from 'react-native-sqlite-storage';

const insertDadosUser = (data, tokenData) => {
    const db = SQLite.openDatabase(
        { name: 'velotrab.db', location: 'default' },
        () => '',
        error => console.error(':', error)
    );

    const nome = data.nome;
    const cpf = data.cpf;
    const usaPonto = 'T';
    const token = tokenData;

    // console.log(data)

    db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM dados_user WHERE cpf = ?',
          [cpf],
          (tx, results) => {
            const rows = results.rows;
            if (rows.length > 0) {
              // Se já existe um registro com o CPF fornecido, atualize todos os dados desse registro
              const existingData = rows.item(0);
              tx.executeSql(
                'UPDATE dados_user SET nome = ?, usa_ponto = ?, token = ? WHERE cpf = ?',
                [nome, usaPonto, token, cpf],
                () => {
                  console.log('Dados atualizados com sucesso!');
                  db.close();
                },
                error => {
                  console.error('Erro ao atualizar dados:', error);
                }
              );
            } else {
              // Caso contrário, insira um novo registro
              tx.executeSql(
                'INSERT INTO dados_user (nome, cpf, usa_ponto, token) VALUES (?, ?, ?, ?)',
                [nome, cpf, usaPonto, token],
                () => {
                  console.log('Novo registro inserido com sucesso!');
                  db.close();
                },
                error => {
                  console.error('Erro ao inserir novo registro:', error);
                }
              );
            }
          },
          error => {
            console.error('Erro ao consultar dados:', error);
          }
        );
      });
};

export default insertDadosUser;
