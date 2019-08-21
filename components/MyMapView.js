import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { info, error } from "../MyLog";
import geo_adjust from "../utils/GeoUtil";
import {
    LOCATION_UPDATE_URL,
    FETCH_FRIENDS_URL,
    USER_ID
} from "../utils/Constants";
export default class MyMapView extends Component {

    constructor() {
        super();
        Geolocation.getCurrentPosition(information => {
            geo_adjust(information);
            info("[Periodically]: " + JSON.stringify(information));
            this.setState({
                lat: information.coords.latitude,
                lng: information.coords.longitude,
                friends: []
            });
        });
    }

    // state = {
    //     lat: 0,
    //     lng: 0,
    // }

    componentDidMount() {
        info("Getting current position when MyMapView mounted ...");
        this.timoutInterval = setInterval(() => {
            Geolocation.getCurrentPosition(information => { // update self geo
                geo_adjust(information);
                fetch(LOCATION_UPDATE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "USER-ID": USER_ID
                    },
                    body: JSON.stringify({ location: information }),
                }).catch((e) => {
                    error(e);
                });
                this.setState({
                    lat: information.coords.latitude,
                    lng: information.coords.longitude,
                });
            }, (e) => {
                error(e.message);
            }, { enableHighAccuracy: true, timeout: 10000 }
            );

            fetch(FETCH_FRIENDS_URL, {
                method: "GET",
            }).then((response) => response.json())
                .then((responseJson) => {
                    // info(responseJson);
                    this.setState({ friends: responseJson });
                })
                .catch((e) => {
                    error(e);
                });
        }, 15000);
    }

    render() {
        if (this.state === null) {
            return null;
        }
        return (
            < MapView
                style={styles.map}
                initialRegion={{
                    latitude: this.state.lat,
                    longitude: this.state.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                    title="我"
                    image={require("../assets/pin.png")}
                ></Marker>

                {this.state.friends.map((friend) => {
                    if (friend.location === null) {
                        return null;
                    }
                    info(`rendering ${friend.name} (${friend.location.latitude}, ${friend.location.longitude})`);
                    return <Marker
                        key={friend.id}
                        coordinate={{ latitude: friend.location.latitude, longitude: friend.location.longitude }}
                        title={friend.name}
                        image={require("../assets/pin.png")}
                    >
                    </Marker>;

                })}

            </MapView >
        );
    }


}


const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});