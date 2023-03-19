import React, { useState, useEffect } from "react";
import { Button, Text, View } from "react-native";
import styles from '../style/styles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SCOREBOARD_KEY } from '../constants/game';
// import header footer

export default Scoreboard = ( {navigation} ) => {

    const [scores, setScores] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        });
        return unsubscribe;
    }, [navigation]);

    const getScoreboardData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
          if (jsonValue !== null) {
            let tmpScores = JSON.parse(jsonValue);
            tmpScores.sort((a, b) => b.points - a.points);
            setScores(tmpScores.slice(0, 7));
          } else {
            setScores([]);
          }
        }
        catch (error) {
          console.log('read error: ' + error.message);
        }
      }

      const clearScoreboard = async () => {
        try {
            await AsyncStorage.removeItem(SCOREBOARD_KEY);
            setScores([]);
        } catch (error) {
            console.log(error.message);
        }
      }

    return(
        <View>
            <Header />
            <View>
                {scores.map((player, i) => (
                    <Text key={i}>{i + 1}. {player.name} {player.date} {player.time} {player.points}</Text>
                ))}
                <Button title="clear scoreboard" onPress={clearScoreboard} /> 
            </View>
            <Footer />
        </View>
    ) 
}