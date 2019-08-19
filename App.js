/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */




import React, { Fragment } from 'react';

import {
    YellowBox,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    AppState,
} from 'react-native';

import {
    Header,
    LearnMoreLinks,
    Colors,
    DebugInstructions,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

YellowBox.ignoreWarnings(['Remote debugger']);

import { info, error, debug, warn } from "./MyLog.js";
info("Starting ... " + AppState.currentState);
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from 'react-native-background-timer';
import MyMapView from "./components/MyMapView.js";


BackgroundTimer.runBackgroundTimer(() => {
    Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
    info("app state: " + AppState.currentState);
},
    3000);

BackgroundTimer.start();


const App = () => {
    return (
        <MyMapView />
    );
};

const styles = StyleSheet.create({
});

export default App;
