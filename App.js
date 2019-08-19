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

import MapView from 'react-native-maps';
// info("mapview: " + MapView);





BackgroundTimer.runBackgroundTimer(() => {
    Geolocation.getCurrentPosition(information => info(information));
    info("app state: " + AppState.currentState);
},
    3000);

BackgroundTimer.start();

import { Marker } from 'react-native-maps';

const App = () => {
    return (

        // <View>
        //     <Text>abc</Text>
        // </View>

        // <MapView
        //     initialRegion={{
        //         latitude: 37.78825,
        //         longitude: -122.4324,
        //         latitudeDelta: 0.0922,
        //         longitudeDelta: 0.0421,
        //     }}
        // />




        <MapView
            style={styles.map}
            initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        >

            <Marker
                coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                title="hallo"
                description="my desc"
                image={require("./assets/pin.png")}
            >

            </Marker>

        </MapView>



    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default App;
