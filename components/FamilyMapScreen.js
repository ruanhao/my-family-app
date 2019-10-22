import React, { Component } from 'react';
import {
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Image,
    AppState,
    View,
    TouchableOpacity,
    Alert,
    Text
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import {
    updateForgroundLocation,
    configBackgroundFetch,
    configBackgroundGeoLocation
} from '../utils/Utils';
import { info } from "../utils/LogUtils";
import { NavigationEvents } from 'react-navigation';
import Toast from 'react-native-root-toast';
import { getDistance } from 'geolib';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
// import SplashScreen from 'react-native-splash-screen'

const DISTANCE_TOLERANCE = 15;

const pinImage = require("../assets/pin.png");
const menuImage = require("../assets/menu.png");
const myLocImage = require("../assets/myloc.png");
const radarImage = require("../assets/radar.png");
const friendsImage = require("../assets/friends.png");
const refreshImage = require("../assets/refresh.png");

const msg = {
    mapLoading: '加载中...',
};

export default class FamilyMapScreen extends Component {

    static navigationOptions = {
        header: null,
        title: 'Map'
    };

    state = {
        location: null,/* {latitude: 0, longitude: 0, altitude: 0} */
        nextFriendIndex: 0,/* used to select friend round robin */
        friends: [],/* [{location:{latitude: 0, longitude: 0, altitude: 0}, name: "", id: ""}] */
    }

    constructor() {
        super();
    }

    updateSelfLocationAndThenRender = (force = false) => {
        updateForgroundLocation((userLocations) => {
            let myLastLocation = this.state.location;
            let myCurrentLocation = userLocations[0].location;
            if (!force && myLastLocation) {
                if (getDistance(myLastLocation, myCurrentLocation) < DISTANCE_TOLERANCE) {
                    myCurrentLocation = myLastLocation;
                }
            }
            this.setState({
                location: myCurrentLocation,
                friends: userLocations.slice(1),
            });
        });
    }

    /* updateFriendsLocation = () => {
     *     fetch(FETCH_FRIENDS_URL, {
     *         method: "GET",
     *     })
     *         .then((response) => response.json())
     *         .then((responseJson) => {
     *             this.setState({ friends: responseJson });
     *         })
     *         .catch((e) => {
     *             error("Error when fetching friends: " + e.message);
     *         });
     * }*/

    componentDidMount() {
        configBackgroundFetch();
        configBackgroundGeoLocation();
        this.timoutInterval = setInterval(() => {
            if (AppState.currentState === 'active') {
                const { navigation } = this.props;
                navigation.isFocused() && this.updateSelfLocationAndThenRender();
            }
        }, 5000);
        this.updateSelfLocationAndThenRender();
        AppState.addEventListener('change', this._handleAppStateChange);
        // setTimeout(() => SplashScreen.hide(), 3000);
        PushNotificationIOS.addEventListener('register', this._onRegistered);
        PushNotificationIOS.addEventListener('registrationError', this._onRegistrationError);
        PushNotificationIOS.addEventListener('notification', this._onRemoteNotification);
        PushNotificationIOS.requestPermissions();
    }

    componentWillUnmount() {
        PushNotificationIOS.removeEventListener('register', this._onRegistered);
        PushNotificationIOS.removeEventListener('registrationError', this._onRegistrationError);
        PushNotificationIOS.removeEventListener('notification', this._onRemoteNotification);
    }

    _onRegistered = (deviceToken) => {
        console.log("token: ", deviceToken);
        info("token: " + JSON.stringify(deviceToken));
    }

    _onRegistrationError = (error) => {
        Alert.alert(
            'Failed To Register For Remote Push',
            `Error (${error.code}): ${error.message}`,
            [
                {
                    text: 'OK',
                    onPress: null,
                },
            ],
        );
    }

    _onRemoteNotification = (notification) => {
        const result = `Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()}.`;

        Alert.alert('Push Notification Received', result, [
            {
                text: 'OK',
                onPress: null,
            },
        ]);
    }


    _handleAppStateChange = (nextState) => {
        if (nextState === 'active') {
            this.updateSelfLocationAndThenRender();
            // this.updateFriendsLocation();
        }
    }

    _fitMe = () => {
        this.map.animateCamera({ center: this.state.location, altitude: this.state.location.altitude + 1000 });
    }

    _fitNextFriend = () => {
        let len = this.state.friends.length;
        if (len === 0) {
            return;
        }
        let friend = this.state.friends[this.state.nextFriendIndex % len];
        this.map.animateCamera({ center: friend.location, altitude: friend.location.altitude + 1000 });
        this.state.nextFriendIndex += 1;
        Toast.show(friend.name, {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            backgroundColor: 'grey'
        });

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

    _onDidFocus = (payload) => {

    }

    _onDidBlur = (payload) => {

    }

    render() {
        if (this.state.location === null) {
            // return <MapView style={styles.map} />;
            return (
                <View style={{
                    flex: 1, justifyContent: 'center', alignItems: 'center'
                }}>
                    <ActivityIndicator />
                    <Text style={{ top: 5 }}>{msg.mapLoading}</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <NavigationEvents
                    onDidFocus={payload => this._onDidFocus(payload)}
                    onDidBlur={payload => this._onDidBlur(payload)}
                />

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
                        coordinate={{
                            latitude: this.state.location.latitude,
                            longitude: this.state.location.longitude
                        }}
                    >
                        <Callout>
                            <Text>我</Text>
                        </Callout>
                        {/*<Image source={pinImage} style={{ height: 30, width: 30 }} />*/}
                    </Marker>

                    {this.state.friends.map(friend => {
                        return (
                            <Marker
                                key={friend.id}
                                coordinate={{
                                    latitude: friend.location.latitude,
                                    longitude: friend.location.longitude
                                }}
                                pinColor='dodgerblue'
                                title={friend.name}
                                description={friend.location.updatedDate}
                            />

                        );
                    })}
                </MapView >


                <View style={styles.menu}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('Menu')}>
                        <Image
                            source={menuImage}
                            style={{ height: 20, width: 30 }}
                        />
                    </TouchableOpacity>
                </View>



                <View style={styles.buttonContainer} >
                    <TouchableOpacity
                        onPress={() => { this._fitMe() }}
                        style={[styles.bubble, styles.button]}
                    >
                        <Image
                            source={myLocImage}
                            style={{ height: 25, width: 25 }}
                        />
                    </TouchableOpacity>

                    {this.state.friends.length > 0 &&
                        <TouchableOpacity
                            onPress={() => { this._fitNextFriend() }}
                            style={[styles.bubble, styles.button]}
                        >
                            <Image
                                source={friendsImage}
                                style={{ height: 25, width: 25 }}
                            />
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        onPress={() => this._fitAll()}
                        style={[styles.bubble, styles.button]} >
                        <Image
                            source={radarImage}
                            style={{ height: 25, width: 25 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { this.updateSelfLocationAndThenRender(true) }}
                        style={[styles.bubble, styles.button]}
                    >
                        <Image
                            source={refreshImage}
                            style={{ height: 25, width: 25 }}
                        />
                    </TouchableOpacity>
                </View>
            </View >
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
    menu: {
        ...StyleSheet.absoluteFillObject,
        marginTop: 50,
        marginLeft: 20,
        height: 20,
        width: 30,
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