import DeviceInfo from 'react-native-device-info';
const SERVER = "http://localhost:8080";
// const SERVER = "http://13.114.34.198:8080";

const USER_ID = "5d5d3eb400f621411ef50db0"; // me

const LOG_URL = `${SERVER}/remote/log`;
const LOCATION_UPDATE_URL = `${SERVER}/location`;
const FETCH_FRIENDS_URL = `${SERVER}/users/${USER_ID}/friends`;


const DEVICE_NAME = DeviceInfo.getDeviceName();



export {
    FETCH_FRIENDS_URL,
    LOG_URL,
    USER_ID,
    LOCATION_UPDATE_URL,
    DEVICE_NAME
}