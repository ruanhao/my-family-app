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
// import BackgroundTimer from 'react-native-background-timer';
import MyMapView from "./components/MyMapView.js";
import BackgroundFetch from "react-native-background-fetch";

// BackgroundTimer.runBackgroundTimer(() => {
//     Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
//     info("app state: " + AppState.currentState);
// },
//     15 * 60 * 1000);

// BackgroundTimer.start();


import BackgroundGeolocation from "react-native-background-geolocation";
import geo_adjust from "./utils/GeoUtil";


BackgroundGeolocation.onLocation((loc) => {
    geo_adjust(loc);
    info(loc);
}, (err) => { error(err); });

BackgroundGeolocation.ready({
    reset: true,
    // Geolocation Config
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 10,
    // Activity Recognition
    stopTimeout: 1,
    // Application config
    debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
    startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
    // HTTP / SQLite config
    url: 'http://yourserver.com/locations',
    batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
    autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
    headers: {              // <-- Optional HTTP headers
        "X-FOO": "bar"
    },
    params: {               // <-- Optional HTTP params
        "auth_token": "maybe_your_server_authenticates_via_token_YES?"
    }
}, (state) => {
    info("- BackgroundGeolocation is configured and ready: ", state.enabled);

    if (!state.enabled) {
        ////
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(function() {
            info("- Start success");
        });
    }
});


BackgroundFetch.configure({
    minimumFetchInterval: 15,     // <-- minutes (15 is minimum allowed)
    // Android options
    stopOnTerminate: false,
    startOnBoot: true,
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
    requiresCharging: false,      // Default
    requiresDeviceIdle: false,    // Default
    requiresBatteryNotLow: false, // Default
    requiresStorageNotLow: false  // Default
}, () => {
    info("[js] Received background-fetch event");
    Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
    // Required: Signal completion of your task to native code
    // If you fail to do this, the OS can terminate your app
    // or assign battery-blame for consuming too much background-time
    BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
}, (error) => {
    info("[js] RNBackgroundFetch failed to start");
});

BackgroundFetch.status((status) => {
    switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
            info("BackgroundFetch restricted");
            break;
        case BackgroundFetch.STATUS_DENIED:
            info("BackgroundFetch denied");
            break;
        case BackgroundFetch.STATUS_AVAILABLE:
            info("BackgroundFetch is enabled");
            break;
    }
});


const App = () => {
    return (
        <MyMapView />
    );
};

const styles = StyleSheet.create({
});

export default App;
