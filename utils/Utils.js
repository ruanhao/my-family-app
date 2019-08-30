import Geolocation from '@react-native-community/geolocation';
import {
    LOCATION_UPDATE_URL,
    USER_ID
} from "./Constants";
import { error } from "../MyLog";

export function updateLocation(callback = (location) => { }) {
    Geolocation.getCurrentPosition(
        (location) => {
            fetch(LOCATION_UPDATE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "USER-ID": USER_ID
                },
                body: JSON.stringify({ location: location }),
            }).catch((e) => {
                error("Error when update self location: " + e.message);
            });
            callback(location);
        },
        (e) => {
            error("Error when getting current position: " + e.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}