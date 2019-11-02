import Geolocation from '@react-native-community/geolocation';
import BackgroundFetch from "react-native-background-fetch";
import {
    LOCATION_UPDATE_URL,
    FETCH_FOOTPRINT_URL,
    UPDATE_DEVICE_TOKEN_URL,
    ACK_NOTIFICATION_URL,
    ACK_ALL_NOTIFICATION_URL,
} from "./Constants";
import { info, error } from "./LogUtils";
import BackgroundGeolocation from "react-native-background-geolocation";
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, AppState, Platform, PixelRatio, Dimensions } from 'react-native';
import RNFS from "react-native-fs";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
var PushNotification = require("react-native-push-notification");


let lastUserId = '';

export async function getUserIdAsync() {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
        lastUserId = userId;
    }
    return userId;
}

const ACTIVITY_UPDATE_TYPE = '/activity';
const FOREGROUND_UPDATE_TYPE = '/foreground';
const REFRESH_ALL_UPDATE_TYPE = '/refresh-all';
const BACKGROUND_UPDATE_TYPE = '/background';
const BACKGROUND_FETCH_UPDATE_TYPE = '/background-fetch';
const AD_HOC_UPDATE_TYPE = '/ad-hoc';

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

export function refreshAllLocation(callback) {
    updateLocation(REFRESH_ALL_UPDATE_TYPE, callback);
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
                    'USER-ID': await getUserIdAsync(),
                },
            });
        return await response.json();
    } catch (e) {
        error("Error when fetching latest footprints: " + e.message);
    }

}

export async function updateBackgroundLocation(location) {
    let current = new Date().getTime();
    if (current - lastUpdate < UPDATE_INTERVAL) {
        return;
    }
    lastUpdate = current;
    if (location) {
        const userId = await getUserIdAsync();
        if (!userId) {
            return;
        }
        let headers = {
            "Content-Type": "application/json",
            "USER-ID": userId,
        };
        let deviceToken = await AsyncStorage.getItem('deviceToken');
        if (deviceToken) {
            headers['DEVICE-TOKEN'] = deviceToken;
        }
        const { coords: { latitude, longitude, speed, altitude, heading } } = location;
        fetch(LOCATION_UPDATE_URL + BACKGROUND_UPDATE_TYPE,
            {
                method: 'POST',
                headers: headers,
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

export function updateLocationOnStartup() {
    updateLocation(AD_HOC_UPDATE_TYPE);
}

async function updateLocation(type = FOREGROUND_UPDATE_TYPE, callback = (_) => { }) {
    let userId = await getUserIdAsync();
    if (!userId) {
        if (!lastUserId) {
            return;
        } else {
            userId = lastUserId;
        }
    }
    let headers = {
        "Content-Type": "application/json",
        "USER-ID": userId,
    };
    let deviceToken = await AsyncStorage.getItem('deviceToken');
    if (deviceToken) {
        headers['DEVICE-TOKEN'] = deviceToken;
    }
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
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                // lastUpdate = new Date().getTime();
                if (type === FOREGROUND_UPDATE_TYPE || type === REFRESH_ALL_UPDATE_TYPE) {
                    let adjustedUserLocations = await response.json();
                    callback(adjustedUserLocations);
                }
                if (type === AD_HOC_UPDATE_TYPE) {
                    callback();
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
    /* BackgroundGeolocation.start(
     *     () => {
     *         info("BackgroundGeolocation ENABLED successfully");
     *         successFn();
     *     },
     *     e => {
     *         error("Failed to ENABLE BackgroundGeoLocation: " + e.message);
     *     }
     * );*/
    configBackgroundGeoLocation(successFn);
}

export function disableBackgroundGeoLocation(successFn = () => { }) {
    BackgroundGeolocation.removeListeners();
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

export async function configBackgroundGeoLocation(successFn = () => { }) {
    const backgroundGeoLocationEnabled = await AsyncStorage.getItem("backgroundGeoLocationEnabled");
    if (backgroundGeoLocationEnabled === 'false') {
        return;
    }
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

export function logout(navigation) {
    Alert.alert(
        '确定退出登陆',
        '',
        [
            {
                text: '确定',
                onPress: () => {
                    disableBackgroundGeoLocation(async () => {
                        info("Signing out!");
                        await AsyncStorage.clear();
                        navigation.navigate('Auth');
                    });
                }
            },
            {
                text: '取消',
                onPress: () => { },
                style: 'cancel',
            },
        ],
        { cancelable: false },
    );
}

export function getFileName(name) {
    const FILE = Platform.OS === 'ios' ? '' : 'file://';
    return FILE + RNFS.DocumentDirectoryPath + '/' + name;
}

export function downloadAndGetImageUrl(name, source_url) {
    let fileName = getFileName(name);
    return RNFS.exists(fileName)
        .then(response => {
            if (response) {
                return { uri: fileName }
            } else {
                let destination_path = '/' + name;
                return RNFS.downloadFile({
                    fromUrl: source_url,
                    toFile: RNFS.DocumentDirectoryPath + destination_path
                }).promise.then(response => {
                    return { uri: fileName }
                }).catch((error) => {
                    return { uri: source_url }
                });
            }
        })
        .catch((error) => {
            return { uri: source_url }
        });
}

const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
    const newSize = size * scale
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize))
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
}

async function updateDeviceToken(deviceToken) {
    if (!deviceToken) {
        return;
    }
    let userId = await getUserIdAsync();
    if (!userId) {
        if (!lastUserId) {
            return;
        } else {
            userId = lastUserId;
        }
    }
    const url = UPDATE_DEVICE_TOKEN_URL + "/" + deviceToken;
    try {
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "USER-ID": userId,
                "DEVICE-TOKEN": deviceToken,
            },
        });
    } catch (e) {
        err("Error when updating device token: " + e.message);
    }
}

async function ackNotification() {
    try {
        await fetch(ACK_NOTIFICATION_URL,
            {
                method: 'POST',
                headers: {
                    'USER-ID': await getUserIdAsync(),
                },
            });
    } catch (e) {
        error("Error when ack notificatino: " + e.message);
    }
    PushNotificationIOS.getApplicationIconBadgeNumber((num) => { // get current number
        if (num >= 1) {
            PushNotificationIOS.setApplicationIconBadgeNumber(num - 1); //set number to 0
        }
    });
}

export async function ackAllNotification() {
    try {
        await fetch(ACK_ALL_NOTIFICATION_URL,
            {
                method: 'POST',
                headers: {
                    'USER-ID': await getUserIdAsync(),
                },
            });
    } catch (e) {
        error("Error when ack all notificatino: " + e.message);
    }
    PushNotificationIOS.getApplicationIconBadgeNumber((num) => { // get current number
        if (num >= 1) {
            PushNotificationIOS.setApplicationIconBadgeNumber(0); //set number to 0
        }
    });
}

export function configPushNotification() {
    info("Configuating push notificaion...");
    PushNotification.configure({
        // Called when Token is generated (iOS and Android)
        onRegister: async function({ token }) {
            console.log("TOKEN:", token);
            await AsyncStorage.setItem('deviceToken', token);
            await updateDeviceToken(token);
        },

        // Called when a remote or local notification is opened or received
        onNotification: function(notification) {
            // console.log("NOTIFICATION:", notification);
            info("Receive notification: " + JSON.stringify(notification));
            // see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios
            if (notification.message && !notification.foreground) {
                ackNotification();
            } else { // silent
                updateLocation(AD_HOC_UPDATE_TYPE, () => { notification.finish(PushNotificationIOS.FetchResult.NewData); });
            }

        },

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         */
        requestPermissions: true
    });
}
