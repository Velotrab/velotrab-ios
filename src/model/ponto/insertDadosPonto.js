import SQLite from 'react-native-sqlite-storage';

const insertDadosPonto = (data) => {
    console.log(data.data_hora);
    const db = SQLite.openDatabase(
        { name: 'velotrab.db', location: 'default' },
        () => console.log(''),
        // error => console.error('Erro ao abrir o banco de dados:', error)
    );
    
    const data_hora = data.data_hora;
    const dataAtual = data.data;
    const hora = data.hora;
    const latitude = data.latitude;
    const longitude = data.longitude;
    const localizacao = data.localizacao;
    const status = data.status;
    const token = data.token;
    const tipo_registro = data.tipo_registro;

    // Verificar se todos os campos têm valores
    if (
        data_hora &&
        dataAtual &&
        hora &&
        // latitude &&
        // longitude &&
        localizacao &&
        status &&
        token &&
        tipo_registro
    ) {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO registros_ponto (data_hora, data, hora, latitude, longitude, localizacao, status, token, tipo_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [data_hora, dataAtual, hora, latitude, longitude, localizacao, status, token, tipo_registro],
                () => {
                    db.close();
                    console.log('Novo registro inserido com sucesso!');
                },
                error => {
                    db.close();
                    // console.error('Erro ao inserir novo registro:', error);
                }
            );
        });
    } else {
        console.error('Erro ao inserir novo registro: Nem todos os campos estão preenchidos.');
    }
};

export default insertDadosPonto;
