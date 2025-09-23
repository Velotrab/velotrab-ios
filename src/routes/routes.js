import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

import Home from '../pages/home/index';
import PontoOff from '../pages/ponto/PontoOff';
import HistoricoPonto from '../pages/ponto/HistoricoPonto';

export default function Routes() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false, headerTitle: "Sem conexão!" }} />
            <Stack.Screen name="PontoOff" component={PontoOff} options={{ headerShown: true, headerTitle: "Registrar Ponto" }} />
            <Stack.Screen name="HistoricoPonto" component={HistoricoPonto} options={{ headerShown: true, headerTitle: "Histórico Ponto" }} />
        </Stack.Navigator>
    );
}