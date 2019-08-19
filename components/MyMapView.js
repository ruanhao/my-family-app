import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { info } from "../MyLog";
export default class MyMapView extends Component {

    componentDidMount() {
        info("My map view mounted ============");
    }

    render() {
        return (
            < MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >

                <Marker
                    coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                    title="hallo"
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