import React, { Component } from 'react';
import { StyleSheet, Image, AppState, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {
    FETCH_FRIENDS_URL,
} from "../utils/Constants";
import { updateLocation } from '../utils/Utils';
import geo_adjust from "../utils/GeoUtil";

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
        updateLocation((location) => {
            adjustedLoc = geo_adjust(location.coords.latitude, location.coords.longitude);
            this.setState({
                location: {
                    latitude: adjustedLoc.latitude,
                    longitude: adjustedLoc.longitude,
                }
            });
        });
    }

    updateFriendsLocation = () => {
        fetch(FETCH_FRIENDS_URL, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((responseJson) => {
                adjustedResponseJson = responseJson.map(friend => {
                    if (!('location' in friend)) {
                        return friend;
                    }
                    friend.location = geo_adjust(friend.location.latitude, friend.location.longitude);
                    return friend;
                });
                this.setState({ friends: adjustedResponseJson });
            })
            .catch((e) => {
                error("Error when fetching friends: " + e.message);
            });
    }

    componentDidMount() {
        this.timoutInterval = setInterval(() => {
            if (AppState.currentState === 'active') {
                this.updateSelfLocation();
                this.updateFriendsLocation();
            }
        }, 10000);
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextState) => {
        if (nextState === 'active') {
            this.updateSelfLocation();
            this.updateFriendsLocation();
        }
    }

    _fitMe = () => {
        this.map.animateCamera({ center: this.state.location });
    }

    _fitAll = () => {
        let markers = this.state.friends.map((friend) => {
            return {
                latitude: friend.location.latitude,
                longitude: friend.location.longitude,
            };
        });
        markers.push(this.state.location);
        this.map.fitToCoordinates(markers, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
        });
    }

    render() {
        if (typeof this.state.location === "undefined") {
            return null;
        }
        return (
            <View style={styles.container}>
                < MapView
                    ref={ref => { this.map = ref; }}
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
                        return <Marker
                            key={friend.id}
                            coordinate={{ latitude: friend.location.latitude, longitude: friend.location.longitude }}
                            title={friend.name}
                        >
                            <Image
                                source={require("../assets/pin.png")}
                                style={{ height: 25, width: 25 }}
                            />
                        </Marker>;

                    })}
                </MapView >

                <View style={styles.buttonContainer} >
                    <TouchableOpacity
                        onPress={() => { this._fitMe() }}
                        style={[styles.bubble, styles.button]}
                    >
                        <Image
                            source={require("../assets/myloc.png")}
                            style={{ height: 25, width: 25 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this._fitAll()}
                        style={[styles.bubble, styles.button]} >
                        <Image
                            source={require("../assets/radar.png")}
                            style={{ height: 25, width: 25 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    buttonContainer: {
        // flexDirection: 'row',
        marginVertical: 50,
        backgroundColor: 'transparent',
        alignSelf: "flex-end",
    },
    bubble: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
    },
    button: {
        marginTop: 5,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
    },
});