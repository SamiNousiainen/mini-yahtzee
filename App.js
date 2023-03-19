import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from './components/header';
import Footer from './components/footer';
import Home from './components/home';
import Gameboard from './components/gameboard';
import styles from './style/styles';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Scoreboard from './components/scoreboard';


const Tab = createBottomTabNavigator();

export default function App() {



  return (
    <NavigationContainer >
      
      <Tab.Navigator>
        
        <Tab.Screen name='Home' component={Home} 
        options={{tabBarStyle: {display : "none"}}}/>
        <Tab.Screen name='Gameboard' component={Gameboard} />
        <Tab.Screen name='Scoreboard' component={Scoreboard} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}