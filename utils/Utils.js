import Geolocation from '@react-native-community/geolocation';
import BackgroundFetch from "react-native-background-fetch";
import {
    LOCATION_UPDATE_URL,
    FETCH_FOOTPRINT_URL,
    USER_ID
} from "./Constants";
import { info, error } from "./LogUtils";
import BackgroundGeolocation from "react-native-background-geolocation";
import { AppState } from 'react-native';

const ACTIVITY_UPDATE_TYPE = '/activity';
const FOREGROUND_UPDATE_TYPE = '/foreground';
const BACKGROUND_UPDATE_TYPE = '/background';
const BACKGROUND_FETCH_UPDATE_TYPE = '/background-fetch';

const UPDATE_INTERVAL = 10000;

let lastUpdate = new Date().getTime();

export function updateActivityLocation(activity, confidence) {
    let current = new Date().getTime();
    if (current - lastUpdate < UPDATE_INTERVAL) {
        return;
    }
    lastUpdate = current;
    let url = `${ACTIVITY_UPDATE_TYPE}/${activity}/${confidence}`;
    updateLocation(url);
}

export function updateForgroundLocation(callback) {
    updateLocation(FOREGROUND_UPDATE_TYPE, callback);
}

export function updateBackgroundFetchLocation() {
    let current = new Date().getTime();
    if (current - lastUpdate < UPDATE_INTERVAL) {
        return;
    }
    lastUpdate = current;
    updateLocation(BACKGROUND_FETCH_UPDATE_TYPE);
}

export async function latestFootprints() {
    try {
        let response = await fetch(FETCH_FOOTPRINT_URL + '?size=50',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'USER-ID': USER_ID,
                },
            });
        return await response.json();
    } catch (e) {
        error("Error when fetching latest footprints: " + e.message);
    }

}

export function updateBackgroundLocation(location) {
    let current = new Date().getTime();
    if (current - lastUpdate < UPDATE_INTERVAL) {
        return;
    }
    lastUpdate = current;
    if (location) {
        const { coords: { latitude, longitude, speed, altitude, heading } } = location;
        fetch(LOCATION_UPDATE_URL + BACKGROUND_UPDATE_TYPE,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'USER-ID': USER_ID,
                },
                body: JSON.stringify({
                    latitude, longitude, speed, altitude, heading
                }),
            })
            .then((response) => {
                // lastUpdate = new Date().getTime();
            })
            .catch(e => {
                error("Error when updating background location: " + e.message);
            });
    } else {
        updateLocation(BACKGROUND_UPDATE_TYPE);
    }
}

function updateLocation(type = FOREGROUND_UPDATE_TYPE, callback = (_) => { }) {
    const url = LOCATION_UPDATE_URL + type;
    Geolocation.getCurrentPosition(
        async (position) => {
            const { coords: { latitude, longitude, speed, altitude, heading } } = position;
            const payload = {
                latitude, longitude, speed, altitude, heading
            };

            try {
                let response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "USER-ID": USER_ID
                    },
                    body: JSON.stringify(payload),
                });
                // lastUpdate = new Date().getTime();
                if (type === FOREGROUND_UPDATE_TYPE) {
                    let adjustedUserLocations = await response.json();
                    callback(adjustedUserLocations);
                }
            } catch (e) {
                error(`Error when updating location(${type}): ${e.message}`);
            }

            /* const responseFuture =
             *     fetch(url, {
             *         method: "POST",
             *         headers: {
             *             "Content-Type": "application/json",
             *             "USER-ID": USER_ID
             *         },
             *         body: JSON.stringify(payload),
             *     }).catch((e) => {
             *         error("Error when updating location: " + e.message);
             *     });
             * if (type === FOREGROUND_UPDATE_TYPE) {
             *     responseFuture.then(response => response.json()).then(adjustedUserLocations => callback(adjustedUserLocations));
             * }*/

        },
        (e) => {
            error("Error when getting current position: " + e.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

export function configBackgroundFetch() {
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
        // info("[js] Received background-fetch event");
        updateBackgroundFetchLocation();
        // Required: Signal completion of your task to native code
        // If you fail to do this, the OS can terminate your app
        // or assign battery-blame for consuming too much background-time
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, (e) => {
        error("[js] RNBackgroundFetch failed to start: " + e.message);
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
}

export function enableBackgroundGeoLocation(successFn = () => { }) {
    BackgroundGeolocation.start(
        () => {
            info("BackgroundGeolocation ENABLED successfully");
            successFn();
        },
        e => {
            error("Failed to ENABLE BackgroundGeoLocation: " + e.message);
        }
    );
    // configBackgroundGeoLocation(successFn);
}

export function disableBackgroundGeoLocation(successFn = () => { }) {
    // BackgroundGeolocation.removeListeners();
    BackgroundGeolocation.stop(
        () => { // success
            info("BackgroundGeolocation DISABLED successfully");
            successFn();
        },
        e => { // failed
            error("Failed to DISABLE BackgroundGeoLocation: " + e.message);
        }
    );
}

export function configBackgroundGeoLocation(successFn = () => { }) {
    BackgroundGeolocation.on('location',
        location => {
            updateBackgroundLocation(location);
        },
        e => {
            error("Error in BackgroundGeolocation.onLocation: " + e.message);
        });

    /* BackgroundGeolocation.on('heartbeat', location => {
     *     info("onHeartbeat");
     * });*/

    BackgroundGeolocation.on('activitychange', ({ activity, confidence }) => {
        if (AppState.currentState !== 'active') {
            updateActivityLocation(activity, confidence);
            // info(`onActivityChange: ${activity}, ${confidence}`);
        }
    });

    BackgroundGeolocation.on('motionchange', function(isMoving, location) {
        if (AppState.currentState !== 'active') {
            if (isMoving) {
                updateActivityLocation('MOVING', 99);
                BackgroundGeolocation.getState(state => {
                    if (!state.enabled) {
                        BackgroundGeolocation.start(function() {
                            info("BackgroundGeolocation started AGAIN successfully");
                        });
                    }
                });
                // info('Just started MOVING');
            } else {
                updateActivityLocation('STATIONARY', 99);
                // info('Just started STOPPED');
            }
        }
    });

    /* BackgroundGeolocation.on('providerchange', provider => {
     *     info("onProviderchange");
     * });*/

    BackgroundGeolocation.on('enabledchange', (enabled) => {
        if (enabled) {
            info("BackgroundGeolocation POWER ON");
        } else {
            info("BackgroundGeolocation POWER OFF");
        }
    });

    BackgroundGeolocation.ready({
        // Common
        reset: true,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        stationaryRadius: 30,
        distanceFilter: 15,
        // stopOnStationary: true,

        // Logging
        debug: false,
        logMaxDays: 1,
        logLevel: BackgroundGeolocation.LOG_LEVEL_INFO,

        // Activity Recognition
        minimumActivityRecognitionConfidence: 60,
        stopTimeout: 3,
        activityRecognitionInterval: 30000,

        // Application
        stopOnTerminate: false,
        startOnBoot: true,

        // HTTP
        /* url: LOCATION_UPDATE_URL + BACKGROUND_UPDATE_TYPE,
         * headers: {
         *     'USER-ID': USER_ID
         * },
         * httpRootProperty: '.',
         * locationTemplate: '{"latitude":<%= latitude %>,"longitude":<%= longitude %>,"speed":<%= speed %>,"heading":<%= heading %>,"altitude":<%= altitude %>}',*/
        /* autoSync: true,
         * batchSync: false,
         * maxRecordsToPersist: 0,*/

    }, (state) => {
        // info("BackgroundGeolocation is enabled: " + state.enabled);
        if (!state.enabled) {
            BackgroundGeolocation.start(function() {
                info("BackgroundGeolocation STARTED successfully");
                successFn();
            });
        }
    });
}