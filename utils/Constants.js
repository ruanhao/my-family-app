// import DeviceInfo from 'react-native-device-info';
const SERVER = "http://127.0.0.1:8080";
// const USER_ID = "5d6f8a9873a56ef828daca1e"; // ryan
// const USER_ID = "5d70af62bc9134a04d2bb34f"; // chen


// const SERVER = "http://13.114.34.198:8080";
// const USER_ID = "5d5d61bc36e04f0dfc55aed4"; // hao
// const USER_ID = "5d5d61f236e04f0dfc55aed5"; // fiona
// const USER_ID = "5d5d621036e04f0dfc55aed6"; // mom


const LOG_URL = `${SERVER}/remote/log`;
const LOCATION_UPDATE_URL = `${SERVER}/location`;
// const FETCH_FRIENDS_URL = `${SERVER}/users/${USER_ID}/friends`;
const FETCH_FOOTPRINT_URL = `${SERVER}/footprint`;

export const REGISTER_USER_URL = `${SERVER}/users/register`;


// const DEVICE_NAME = DeviceInfo.getDeviceName();


export {
    // FETCH_FRIENDS_URL,
    LOG_URL,
    // USER_ID,
    LOCATION_UPDATE_URL,
    FETCH_FOOTPRINT_URL,
}