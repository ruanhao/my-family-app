
const pi = Math.PI;
const ee = 0.00669342162296594323;
const a = 6378245.0;

function outOfChina(lat, lon) {
    if (lon < 72.004 || lon > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
}

function transformLat(x, y) {
    ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
        + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(x, y) {
    ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
        * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
        * pi)) * 2.0 / 3.0;
    return ret;
}

function gps84_to_gcj02(lat, lon) {
    if (outOfChina(lat, lon)) {
        return { latitude: lat, longitude: lon };
    }
    dLat = transformLat(lon - 105.0, lat - 35.0);
    dLon = transformLon(lon - 105.0, lat - 35.0);
    radLat = lat / 180.0 * pi;
    magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    mgLat = lat + dLat;
    mgLon = lon + dLon;
    return { latitude: mgLat, longitude: mgLon };
}

export default function geo_adjust(location) {
    originLat = location.coords.latitude;
    originLng = location.coords.longitude;
    adjusted = gps84_to_gcj02(originLat, originLng);
    location.coords.latitude = adjusted.latitude;
    location.coords.longitude = adjusted.longitude;;
    return location;
}

// console.log(gps84_to_gcj02(31.173036552494477, 121.39370258731522));