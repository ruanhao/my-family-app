import React, { Component } from 'react';
import { StyleSheet, Image, AppState } from 'react-native';
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

    state = {
        friends: []
    }

    constructor() {
        super();
        this.updateSelfLocation();
        this.updateFriendsLocation();
    }

    updateSelfLocation = () => {
        Geolocation.getCurrentPosition(location => {
            geo_adjust(location);
            fetch(LOCATION_UPDATE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "USER-ID": USER_ID
                },
                body: JSON.stringify({ location: location }),
            }).catch((e) => {
                error(e);
            });
            this.setState({
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                }
            });
        }, (e) => {
            error(e.message);
        }, { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    updateFriendsLocation = () => {
        fetch(FETCH_FRIENDS_URL, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ friends: responseJson });
            })
            .catch((e) => {
                error(e);
            });
    }

    componentDidMount() {
        this.timoutInterval = setInterval(() => {
            if (AppState.currentState === 'active') {
                this.updateSelfLocation();
                this.updateFriendsLocation();
            }
        }, 10000);
    }

    render() {
        if (typeof this.state.location === "undefined") {
            return null;
        }
        return (
            < MapView
                style={styles.map}
                initialRegion={{
                    latitude: this.state.location.latitude,
                    longitude: this.state.location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{ latitude: this.state.location.latitude, longitude: this.state.location.longitude }}
                    title="我"
                >
                    <Image
                        source={require("../assets/pin.png")}
                        style={{ height: 35, width: 35 }}
                    />
                </Marker>

                {this.state.friends.map((friend) => {
                    if (!('location' in friend)) {
                        return null;
                    }
                    // info(`rendering ${friend.name} (${friend.location.latitude}, ${friend.location.longitude})`);
                    return <Marker
                        key={friend.id}
                        coordinate={{ latitude: friend.location.latitude, longitude: friend.location.longitude }}
                        title={friend.name}
                    //                        image={require("../assets/pin.png")}
                    >
                        <Image
                            source={require("../assets/pin.png")}
                            style={{ height: 25, width: 25 }}
                        />
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