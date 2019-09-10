import Geolocation from '@react-native-community/geolocation';
import {
    LOCATION_UPDATE_URL,
    USER_ID
} from "./Constants";
import { info, error } from "./LogUtils";


const FOREGROUND_UPDATE_TYPE = '/foreground';
const BACKGROUND_UPDATE_TYPE = '/background';
const BACKGROUND_FETCH_UPDATE_TYPE = '/background-fetch';


export function updateForgroundLocation(callback) {
    updateLocation(FOREGROUND_UPDATE_TYPE, callback);
}

export function updateBackgroundLocation() {
    updateLocation(BACKGROUND_UPDATE_TYPE);
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