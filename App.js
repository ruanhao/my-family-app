import React, { Fragment } from 'react';
import {
    Text,
    YellowBox,
    StyleSheet,
} from 'react-native';
YellowBox.ignoreWarnings(
    [
        'Remote debugger',
        'Warning: componentWillMount is deprecated', /* caused by react-native-reanimated */
        'Accessing view manager configs directly off UIManager via UIManager', /* caused by react-native-root-toast */
        'componentWillReceiveProps is deprecated and will be removed in the next major version', /* caused by react-native-root-toast */
    ]);
import { info } from "./utils/LogUtils";
import Geolocation from '@react-native-community/geolocation';
import FamilyMapScreen from "./components/FamilyMapScreen.js";
import FriendsScreen from "./components/FriendsScreen";
import InfoScreen from "./components/InfoScreen";
import MeScreen from "./components/MeScreen";
import SettingsScreen from "./components/SettingsScreen";
import {
    configBackgroundFetch,
    configBackgroundGeoLocation
} from "./utils/Utils";
import { createAppContainer } from 'react-navigation';
import SafeAreaView from 'react-native-safe-area-view';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

// import BackgroundTimer from 'react-native-background-timer';
// BackgroundTimer.runBackgroundTimer(() => {
//     Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
//     info("app state: " + AppState.currentState);
// },
//     15 * 60 * 1000);
// BackgroundTimer.start();

info("Starting App... ");

configBackgroundFetch();
configBackgroundGeoLocation();

/* const App = () => {
 *     return (
 *         <FamilyMapView />
 *     );
 * };
 * export default App;*/

const MenuTab = createBottomTabNavigator(
    {
        // Friends: FriendsScreen,
        // Me: MeScreen,
        Info: InfoScreen,
        Settings: SettingsScreen,
    }
);

const RootStack = createStackNavigator(
    {
        Map: FamilyMapScreen,
        // Map: SettingsScreen,
        Menu: MenuTab,
    },
);

export default createAppContainer(RootStack);