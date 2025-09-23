import SQLite from 'react-native-sqlite-storage';

const deletarDados = (tableName) => {
    const db = SQLite.openDatabase(
        { name: 'velotrab.db', location: 'default' },
        // error => console.error('Erro ao abrir o banco de dados:', error)
    );

    // Calcula a data há 7 dias atrás
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const dataSeteDiasAtras = seteDiasAtras.toISOString().slice(0, 19).replace('T', ' ');
    console.log('data banco: '+seteDiasAtras);
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM ${tableName} WHERE data_hora <= ?`,
            [dataSeteDiasAtras],
            () => {
                // console.log(`Registros antigos da tabela ponto foram deletados com sucesso!`);
                db.close();
            },
            error => {
                // console.error(`Erro ao deletar registros antigos da tabela ponto:`, error);
                db.close();
            }
        );
    });
};

export default deletarDados;












// import SQLite from 'react-native-sqlite-storage';

// const deletarDados = (tableName) => {
//     const db = SQLite.openDatabase(
//         { name: 'sinergyrh.db', location: 'default' },
//         // () => console.log('Banco de dados "sinergyrh" aberto com sucesso!'),
//         error => console.error('Erro ao abrir o banco de dados:', error)
//     );

//     db.transaction(tx => {
//         tx.executeSql(
//             `DELETE FROM ${tableName}`,
//             [],
//             () => {
//                 console.log(`Todos os registros da tabela ${tableName} foram deletados com sucesso!`);
//             },
//             error => {
//                 console.error(`Erro ao deletar registros da tabela ${tableName}:`, error);
//             }
//         );
//     });
// };

// export default deletarDados;


