import React, { Fragment } from 'react';
import {
    YellowBox,
    StyleSheet,
} from 'react-native';
YellowBox.ignoreWarnings(['Remote debugger']);
import { info, error } from "./utils/LogUtils";
import Geolocation from '@react-native-community/geolocation';
import FamilyMapView from "./components/FamilyMapView.js";
import BackgroundFetch from "react-native-background-fetch";
import {
    updateBackgroundFetchLocation,
    updateBackgroundLocation
} from "./utils/Utils";
import BackgroundGeolocation from "react-native-background-geolocation";

// import BackgroundTimer from 'react-native-background-timer';
// BackgroundTimer.runBackgroundTimer(() => {
//     Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
//     info("app state: " + AppState.currentState);
// },
//     15 * 60 * 1000);
// BackgroundTimer.start();

info("Starting App... ");

BackgroundGeolocation.onLocation((loc) => {
    updateBackgroundLocation();
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
    batchSync: false,
    autoSync: true,
}, (state) => {
    info("BackgroundGeolocation is configured and ready: " + state.enabled);
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
    updateBackgroundFetchLocation();
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
        <FamilyMapView />
    );
};

const styles = StyleSheet.create({
});

export default App;
