/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import Home from './Home';
import CreateDoctor from './CreateDoctor';
import { NavigationContainer } from '@react-navigation/native';
import UpdateDoctor from './UpdateDoctor';
// import UpdateDoctor from './UpdateDoctor';

const SERVER_URI = "www.digitracker.org";
// const SERVER_URI = "192.168.1.10"
// export const serverUrl = `http://${SERVER_URI}:8000`;
export const serverUrl = `https://${SERVER_URI}:8000`;

export enum HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500
}

export interface DoctorDataDTO {
  _id?: string;
  name: string;
  schedule?: string;
  password?: string;
}

// check if it is necessary to define this list ??
export type RootStackParamList = {
  Home: undefined,
  CreateDoctor: undefined,
  UpdateDoctor: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home}/>
        <Stack.Screen name="CreateDoctor" component={CreateDoctor}/>
        {/* todo: check if passing the doctors list like the following would work or not or what are the better ways */}
        <Stack.Screen name="UpdateDoctor" component={UpdateDoctor}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
