// import DeviceInfo from 'react-native-device-info';

// const SERVER = "http://127.0.0.1:8080";
// const USER_ID = "5d6c897f511c9fba8a08c05b"; // ryan


const SERVER = "http://13.114.34.198:8080";
// const USER_ID = "5d5f491136e04f17aef28545"; // test
const USER_ID = "5d5d61bc36e04f0dfc55aed4"; // hao
// const USER_ID = "5d5d61f236e04f0dfc55aed5"; // fiona
// const USER_ID = "5d5d621036e04f0dfc55aed6"; // mom


const LOG_URL = `${SERVER}/remote/log`;
const LOCATION_UPDATE_URL = `${SERVER}/location`;
const FETCH_FRIENDS_URL = `${SERVER}/users/${USER_ID}/friends`;


// const DEVICE_NAME = DeviceInfo.getDeviceName();


export {
    FETCH_FRIENDS_URL,
    LOG_URL,
    USER_ID,
    LOCATION_UPDATE_URL,
}