import Geolocation from '@react-native-community/geolocation';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {
    LOCATION_UPDATE_URL,
    USER_ID
} from "./Constants";
import { info, error } from "./LogUtils";

const FOREGROUND_UPDATE_TYPE = '/foreground';
const BACKGROUND_UPDATE_TYPE = '/background';
const STATIONARY_UPDATE_TYPE = '/stationary';
const BACKGROUND_FETCH_UPDATE_TYPE = '/background-fetch';

const BACKGROUND_LOCATION_UPDATE_INTERVAL = 10000; // 10s

export function updateForgroundLocation(callback) {
    updateLocation(FOREGROUND_UPDATE_TYPE, callback);
}

export function updateBackgroundLocation() {
    updateLocation(BACKGROUND_UPDATE_TYPE);
}

export function updateStationaryLocation() {
    updateLocation(STATIONARY_UPDATE_TYPE);
}

export function updateBackgroundFetchLocation() {
    updateLocation(BACKGROUND_FETCH_UPDATE_TYPE);
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
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

export function configBackgroundGeoLocation() {
    let lastReportTime = new Date().getTime();
    BackgroundGeolocation.on('location', (_location) => {
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        BackgroundGeolocation.startTask(taskKey => {
            // execute long running task
            // eg. ajax post location
            // IMPORTANT: task has to be ended by endTask
            let current = new Date().getTime();
            if (current - lastReportTime > BACKGROUND_LOCATION_UPDATE_INTERVAL) {
                updateBackgroundLocation();
                lastReportTime = current;
            }
            BackgroundGeolocation.endTask(taskKey);
        });
    });

    BackgroundGeolocation.on('error', (e) => {
        error('BackgroundGeolocation error: ' + e.message);
    });

    BackgroundGeolocation.on('stationary', (_stationaryLocation) => {
        updateStationaryLocation();
    });

    BackgroundGeolocation.on('stop', () => {
        info('BackgroundGeolocation service has been stopped');
    });

    BackgroundGeolocation.configure({
        // desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        desiredAccuracy: 10,
        stationaryRadius: 50,
        distanceFilter: 50,/* https://github.com/mauron85/react-native-background-geolocation/blob/master/DISTANCE_FILTER_PROVIDER.md */
        interval: 10000,
        debug: false,
        startOnBoot: true,
        stopOnTerminate: false,
        maxLocations: 0,
        pauseLocationUpdates: true,
        // interval: 10000,/* android only */
        // fastestInterval: 5000,/* android only */
        // activitiesInterval: 10000,/* android only */
    });

    BackgroundGeolocation.checkStatus(status => {
        info('BackgroundGeolocation is running: ' + status.isRunning);
        info('BackgroundGeolocation is enabled: ' + status.locationServicesEnabled);
        info('BackgroundGeolocation is authorized: ' + status.authorization);
        if (!status.isRunning) {
            info("BackgroundGeolocation starting...");
            BackgroundGeolocation.start();
            info("BackgroundGeolocation started!");
        }
    });
}