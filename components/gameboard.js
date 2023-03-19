import React, { useState, useEffect} from "react";
import { Text, View, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; //asenna
import styles from "../style/styles";
import { TabRouter } from "@react-navigation/native";
import {  NBR_OF_DICES, MAX_SPOT, NBR_OF_THROWS, SCOREBOARD_KEY } from '../constants/game';
import { Col, Grid } from 'react-native-easy-grid';
import style from "../style/styles";
import AsyncStorage from '@react-native-async-storage/async-storage'
import Footer from "./footer";
import Header from "./header";

let board = [];


export default Gameboard = ({route}) => {

    const [playerName, setplayerName] = useState('');
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('');
    //this array has info if dice is selcted/not selected
    const [selectedDices, setSelectedDices] = 
      useState(new Array(NBR_OF_DICES).fill(false));
    //spot count selected
      const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(false));
    //dice spots for a throw
      const [diceSpots, setDiceSpots] = useState(new Array(MAX_SPOT).fill(0));
      //total pts
      const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));

    const [scores, setScores] = useState([0]);
    const [totalScore, setTotalScore] = useState(0);


    const row = [];
    for (let i = 0; i < NBR_OF_DICES; i++) {
      row.push(
        <Pressable 
            key={"row" + i}
            onPress={() => selectDice(i)}>
          <MaterialCommunityIcons
            name={board[i]}
            key={"row" + i}
            size={50} 
            color={getDiceColor(i)}>
          </MaterialCommunityIcons>
        </Pressable>
      );
    }

    const pointsRow = [];
    for (let spot = 0; spot < MAX_SPOT; spot++) {
    pointsRow.push(
        <Col key={'points' + spot}>
            <Text key={'points' + spot} style={styles.points}>{getSpotTotal(spot)}</Text>
        </Col>
     )
    }

    const buttonRow = [];
    for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
        buttonRow.push(
        <Col key={"buttonsRow" + diceButton}>
            <Pressable 
              onPress={() => selectDicePoints(diceButton)}
              key={"buttonsRow" + diceButton}>
                <MaterialCommunityIcons name={"numeric-" + (diceButton + 1) + "-circle"}
                 key={"buttonsRow" + diceButton}
                 size={40}
                 color={getDicePtsColor(diceButton)}>
                </MaterialCommunityIcons>
            </Pressable>
        </Col>
        )
    }

    //done once when entering gameboard for the 1st time
    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setplayerName(route.params.player);
            getScoreboardData();
        }
    }, []);

    //done when number of throws changes
    useEffect(() => {
      if(nbrOfThrowsLeft === 0) {
        setStatus('select your points');
      }
      else if (nbrOfThrowsLeft < 0) {
        setNbrOfThrowsLeft(NBR_OF_THROWS-1);
      }
      //pts will be saved when all pts from bottom row have been selected
      else if (selectedDicePoints.every(x => x)) {
        savePlayerPoints();
      }
    }, [nbrOfThrowsLeft]);

    function getDiceColor(i) {
        if (board.every((val, i, arr) => val === arr[0])) {
          return "orange";
        }
        else {
          return selectedDices[i] ? "black" : "steelblue";
        }
      }

      function getDicePtsColor(i) {
        return selectedDicePoints[i] ? "black" : "steelblue";
      }

    function selectDice(i) {
        let dices = [...selectedDices];
        dices[i] = selectedDices[i] ? false : true;
        setSelectedDices(dices);
      }

      function getSpotTotal(i) {
        return dicePointsTotal[i];
      }

      function selectDicePoints(i) {
        let selected = [...selectedDices];
        let selectedPoints = [...selectedDicePoints];
        let points = [...dicePointsTotal];
        if (!selectedPoints[i]) {
          selectedPoints[i] = true;
          let nbrOfDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1: total), 0);
          points[i] = nbrOfDices * (i + 1);
          setDicePointsTotal(points);
        }

        const newTotalScore = points.reduce((sum, value) => sum + value, 0);
        setTotalScore(newTotalScore);

        selected.fill(false);
        setSelectedDices(selected);
        setSelectedDicePoints(selectedPoints);
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        return points[i];
      }

      function throwDices() {
        let spots = [...diceSpots];
        for (let i = 0; i < NBR_OF_DICES; i++) {
          if (!selectedDices[i]) {
            let randomNumber = Math.floor(Math.random() * 6 + 1);
            board[i] = 'dice-' + randomNumber;
            spots[i] = randomNumber;
          }
        }
        setNbrOfThrowsLeft(nbrOfThrowsLeft-1);
        setDiceSpots(spots);
        setStatus('select and throw dices again');
      }

      function checkWinner () {
        if (sum >= WINNING_PTS && nbrOfThrowsLeft > 0) {
            setNbrOfWins(nbrOfWins + 1);
            setStatus('you win');
        }
        else if (sum >= WINNING_PTS && nbrOfThrowsLeft === 0) {
            setNbrOfWins(nbrOfWins + 1);
            setStatus('you win, game over');
        }
        else if (nbrOfWins > 0 && nbrOfThrowsLeft === 0) {
            setNbrOfWins(nbrOfWins + 1);
            setStatus('you win, game over');
        }
        else if (nbrOfThrowsLeft === 0) {
            setStatus('game over');
        }
        else {
            setStatus('keep throwing');
        }
    }

    const getScoreboardData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
        if (jsonValue !== null) {
          let tmpScores = JSON.parse(jsonValue);
          setScores(tmpScores);
        }
      }
      catch (error) {
        console.log('read error: ' + error.message);
      }
    }

    const getCurrentDate = () => {
 
      const date = new Date().getDate();
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
 
      return date + '.' + month + '.' + year;
}

    const getCurrentTime = () => {
      const hours = new Date().getHours();
      const min = new Date().getMinutes();

      return hours + ':' + min;
    }

    const savePlayerPoints = async () => {
      const playerPoints = {
        name: playerName,
        date: getCurrentDate(),
        time: getCurrentTime(),
        points: totalScore 
      }
      try {
        const newScore = [...scores, playerPoints];
        const jsonValue = JSON.stringify(newScore);
        await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
      }
      catch (error) {
        console.log('save error: ' + error.message);
      }

    }

    return(
        <View style={styles.gameboard}>
          <Header />
            <View style={styles.flex}>{row}</View>
            <Text>player: {playerName}</Text>
            <Text style={styles.gameinfo}>Throws left: {nbrOfThrowsLeft}</Text>
            <Text style={styles.gameinfo}>{status}</Text>
        <Pressable style={styles.button} onPress={() => throwDices()}>
          <Text style={styles.buttonText}>
            Throw dices
          </Text>
        </Pressable>
            <View style={styles.dicepoints}><Grid>{pointsRow}</Grid></View>
            <View style={styles.dicepoints}><Grid>{buttonRow}</Grid></View>
            
            {totalScore < 63 ?
            <>
            <Text style={styles.dicepoints}>Total: {totalScore}</Text>
            <Text>Points away from bonus: {(63 - totalScore)}</Text>
            </>
            :
            <>
            <Text style={styles.dicepoints}>Total: {(totalScore + 50)}</Text>
            <Text>Bonus got</Text>
            </>}
            <Text style={styles.gl}>Player: {playerName}</Text>
            <Footer />
        </View>
    ) 
}