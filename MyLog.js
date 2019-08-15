
const url = "http://localhost:8080/remote/log";
// const url = "http://13.114.34.198:8080/remote/log";

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

function doLog(level, content) {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            level: level,
            content: typeof content === 'string' ? content : JSON.stringify(content)
        }),

    }).catch((error) => {
        console[level.toLowerCase()](content);
    });
}
