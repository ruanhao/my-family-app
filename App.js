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
import {
    LOCATION_UPDATE_URL,
    USER_ID,
    DEVICE_NAME
} from "./utils/Constants";

BackgroundGeolocation.onLocation((loc) => {
    // geo_adjust(loc);
    // info(loc);
}, (err) => { error("Error in BackgroundGeolocation.onLocation: " + err); });

BackgroundGeolocation.ready({
    reset: true,
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 20,
    stopTimeout: 1,
    debug: false,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false,
    startOnBoot: true,
    url: LOCATION_UPDATE_URL,
    batchSync: false,
    autoSync: true,
    headers: {
        "USER-ID": USER_ID,
        "DEVICE-NAME": DEVICE_NAME
    },
    params: {
        // "auth_token": "maybe_your_server_authenticates_via_token_YES?"
    }
}, (state) => {
    info("BackgroundGeolocation is configured and ready: ", state.enabled);
    if (!state.enabled) {
        ////
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(function() {
            info("BackgroundGeolocation started successfully");
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
    // Geolocation.getCurrentPosition(information => info(information));
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
