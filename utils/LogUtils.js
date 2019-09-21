// import DeviceInfo from 'react-native-device-info';
import BackgroundGeolocation from "react-native-background-geolocation";
import { LOG_URL } from './Constants';
import { getUserIdAsync } from './Utils';

export function info(content) {
    doLog("INFO", content);
}

export function error(content) {
    doLog("ERROR", content);
}

export function debug(content) {
    doLog("DEBUG", content);
    console.debug(content);
}

export function warn(content) {
    doLog("WARN", content);
}

async function doLog(level, content) {
    const userId = await getUserIdAsync();
    if (!userId) {
        if (level === 'ERROR') {
            BackgroundGeolocation.logger.error(content);
        } else {
            BackgroundGeolocation.logger.info(content);
        }
        console.info(content);
        return;
    }
    fetch(LOG_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "USER-ID": userId,
        },
        body: JSON.stringify({
            level: level,
            content: (typeof content === 'string' ? content : JSON.stringify(content))
        }),

    }).catch((error) => {
        if (level === 'ERROR') {
            BackgroundGeolocation.logger.error(content);
        } else {
            BackgroundGeolocation.logger.info(content);
        }
        console.info(content);
    });
}
