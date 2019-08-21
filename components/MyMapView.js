import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { info, error } from "../MyLog";
export default class MyMapView extends Component {

    state = {
        lat: 0,
        lng: 0,
    }

    componentDidMount() {
        info("Getting current position when MyMapView mounted ...");
        this.timoutInterval = setInterval(() => {
            Geolocation.getCurrentPosition(information => {
                info("[Periodically]: " + JSON.stringify(information));
                this.setState({
                    lat: information.coords.latitude,
                    lng: information.coords.longitude,
                });
            }, (e) => {
                error(e.message);
            }, { enableHighAccuracy: true, timeout: 10000 }
            );
        }, 15000);
    }

    render() {
        return (
            < MapView
                style={styles.map}
                region={{
                    latitude: this.state.lat,
                    longitude: this.state.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >

                <Marker
                    coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                    title="hello"
                    description="my desc"
                    image={require("../assets/pin.png")}
                >

                </Marker>

            </MapView >
        );
    }


}


const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});