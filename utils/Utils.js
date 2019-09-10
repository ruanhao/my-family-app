import Geolocation from '@react-native-community/geolocation';
import {
    LOCATION_UPDATE_URL,
    USER_ID
} from "./Constants";
import { info, error } from "./LogUtils";
import BackgroundGeolocation from "react-native-background-geolocation";
import { AppState } from 'react-native';

const ACTIVITY_UPDATE_TYPE = '/activity';
const FOREGROUND_UPDATE_TYPE = '/foreground';
const BACKGROUND_UPDATE_TYPE = '/background';
const BACKGROUND_FETCH_UPDATE_TYPE = '/background-fetch';

const BACKGROUND_UPDATE_INTERVAL = 15000;
const ACTIVITY_UPDATE_INTERVAL = BACKGROUND_UPDATE_INTERVAL;

let backgroundLastUpdate = new Date().getTime();
let activityLastUpdate = new Date().getTime();

export function updateActivityLocation(activity, confidence) {
    let current = new Date().getTime();
    if (current - activityLastUpdate < ACTIVITY_UPDATE_INTERVAL) {
        return;
    }
    activityLastUpdate = current;
    let url = `${ACTIVITY_UPDATE_TYPE}/${activity}/${confidence}`;
    updateLocation(url);
}

export function updateForgroundLocation(callback) {
    updateLocation(FOREGROUND_UPDATE_TYPE, callback);
}

export function updateBackgroundFetchLocation() {
    updateLocation(BACKGROUND_FETCH_UPDATE_TYPE);
}

export function updateBackgroundLocation(location) {
    let current = new Date().getTime();
    if (current - backgroundLastUpdate < BACKGROUND_UPDATE_INTERVAL) {
        return;
    }
    backgroundLastUpdate = current;
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
            }
        ).catch(e => {
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



export function configBackgroundGeoLocation() {
    BackgroundGeolocation.on('location',
        location => {
            updateBackgroundLocation(location);
        },
        e => {
            error("Error in BackgroundGeolocation.onLocation: " + e.message);
        });

    BackgroundGeolocation.on('heartbeat', location => {
        info("onHeartbeat");
    });

    BackgroundGeolocation.on('activitychange', ({ activity, confidence }) => {
        if (AppState.currentState !== 'active') {
            updateActivityLocation(activity, confidence);
            // info(`onActivityChange: ${activity}, ${confidence}`);
        }
    });

    /* BackgroundGeolocation.on('providerchange', provider => {
     *     info("onProviderchange");
     * });*/

    BackgroundGeolocation.on('enabledchange', event => {
        info("onEnabledchange: " + event.enabled);
    });

    BackgroundGeolocation.ready({
        reset: true,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        stationaryRadius: 30,
        distanceFilter: 10,

        // Debug
        debug: false,
        logMaxDays: 1,
        logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,

        // App
        stopOnTerminate: false,
        startOnBoot: true,
        stopTimeout: 3,
        stopOnStationary: true,

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
        info("BackgroundGeolocation is enabled: " + state.enabled);
        if (!state.enabled) {
            BackgroundGeolocation.start(function() {
                info("BackgroundGeolocation started successfully");
            });
        }
    });
}