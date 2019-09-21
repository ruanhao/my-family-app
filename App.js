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
import AuthLoadingScreen from './components/AuthLoadingScreen';
import SignInScreen from './components/SignInScreen';
/* import {
 *     configBackgroundFetch,
 *     configBackgroundGeoLocation
 * } from "./utils/Utils";*/
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import SafeAreaView from 'react-native-safe-area-view';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// import BackgroundTimer from 'react-native-background-timer';
// BackgroundTimer.runBackgroundTimer(() => {
//     Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
//     info("app state: " + AppState.currentState);
// },
//     15 * 60 * 1000);
// BackgroundTimer.start();

info("Starting App... ");

/* configBackgroundFetch();
 * configBackgroundGeoLocation();*/

/* const App = () => {
 *     return (
 *         <FamilyMapView />
 *     );
 * };
 * export default App;*/

const AuthStack = createStackNavigator({
    SignIn: SignInScreen,
});

const MenuTab = createBottomTabNavigator(
    {
        // Friends: FriendsScreen,
        Info: InfoScreen,
        Settings: SettingsScreen,
        // Me: MeScreen,
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, horizontal, tintColor }) => _getTabBarIcon(navigation, focused, tintColor),
        }),
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            // style: { height: 50 }
        }
    }
);

const AppStack = createStackNavigator(
    {
        Map: FamilyMapScreen,
        // Map: InfoScreen,
        Menu: MenuTab,
    },
);



export default createAppContainer(
    createSwitchNavigator(
        {
            AuthLoading: AuthLoadingScreen,
            App: AppStack,
            Auth: AuthStack,
        },
        {
            initialRouteName: 'AuthLoading',
        }
    )
);


/*
   if you get error like 'Unrecognized font family ionicons'
   please run react-native link react-native-vector-icons manually
 */
const _getTabBarIcon = (navigation, focused, tintColor) => {

    const { routeName } = navigation.state;
    let IconComponent = Ionicons;
    let iconName = 'ios-options';

    if (routeName === 'Info') {
        iconName = "ios-information-circle-outline";
    } else if (routeName === 'Settings') {
        iconName = "ios-settings";
    } else if (routeName === 'Me') {
        iconName = "ios-contact";
    }

    return <IconComponent name={iconName} size={25} color={tintColor} />;
};