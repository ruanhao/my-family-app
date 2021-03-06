import React, { Fragment } from 'react';
import {
    TouchableOpacity,
    View,
    Button,
    Text,
    YellowBox,
    StyleSheet,
} from 'react-native';
YellowBox.ignoreWarnings(
    [
        'Remote debugger',
        'Warning: componentWillUpdate is deprecated',
        'Warning: componentWillMount is deprecated', /* caused by react-native-reanimated */
        'Accessing view manager configs directly off UIManager via UIManager', /* caused by react-native-root-toast */
        'componentWillReceiveProps is deprecated and will be removed in the next major version', /* caused by react-native-root-toast */
    ]);
import { info } from "./utils/LogUtils";
import Geolocation from '@react-native-community/geolocation';
import FamilyMapScreen from "./components/FamilyMapScreen.js";
import FriendsMainScreen from "./components/FriendsMainScreen";
import HousesMainScreen from "./components/HousesMainScreen";
import HouseScreen from "./components/HouseScreen";
import InfoScreen from "./components/InfoScreen";
import MeScreen from "./components/MeScreen";
import SettingsScreen from "./components/SettingsScreen";
import AuthLoadingScreen from './components/AuthLoadingScreen';
import SignInScreen from './components/SignInScreen';
import QRScannerScreen from './components/QRScannerScreen';
import FriendScreen from './components/FriendScreen';
import NotificationScreen from './components/NotificationScreen';
import CitiesAirQualityScreen from './components/CitiesAirQualityScreen';
/* import {
 *     configBackgroundFetch,
 *     configBackgroundGeoLocation
 * } from "./utils/Utils";*/
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import SafeAreaView from 'react-native-safe-area-view';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { updateLocationOnStartup } from './utils/Utils';
import FixedText from './components/FixedText';
import { RFValue } from "react-native-responsive-fontsize";

// import BackgroundTimer from 'react-native-background-timer';
// BackgroundTimer.runBackgroundTimer(() => {
//     Geolocation.getCurrentPosition(information => info(information)); // report my geolocation info
//     info("app state: " + AppState.currentState);
// },
//     15 * 60 * 1000);
// BackgroundTimer.start();

info("Starting App... ");
updateLocationOnStartup();

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
        Me: createStackNavigator({ MeScreen, NotificationScreen, SettingsScreen, InfoScreen, QRScannerScreen, CitiesAirQualityScreen },
            {
                navigationOptions: { tabBarLabel: '我' },
                defaultNavigationOptions: ({ navigation }) => ({
                    // headerBackTitle: null,
                    header: null,
                }),
            }),
        Friends: createStackNavigator({ FriendsMainScreen, FriendScreen },
            {
                navigationOptions: { tabBarLabel: '朋友' },
                defaultNavigationOptions: ({ navigation }) => ({
                    header: null
                    // headerBackTitle: null,
                    /* headerLeft: (
                     *     <Button
                     *         title="< 👬"
                     *         onPress={() => {
                     *             navigation.goBack();
                     *         }}
                     *     />
                     * )*/
                }),

            }),

        Houses: createStackNavigator({ HousesMainScreen, HouseScreen },
            {
                navigationOptions: { tabBarLabel: '房源' },
                defaultNavigationOptions: ({ navigation }) => ({
                    headerStyle: {
                        height: 40,
                    },
                    headerBackTitle: "所有房源",
                    headerStyle: {
                        borderBottomWidth: 0,
                    },
                }),

            }),

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
        Map: {
            screen: FamilyMapScreen,
            navigationOptions: () => ({
                headerBackTitle: "地图",
                // headerBackTitle: null,
            }),
        },
        // Map: InfoScreen,
        Menu: {
            screen: MenuTab,
            navigationOptions: ({ navigation }) => {
                let options = {};
                options.headerStyle = {
                    borderBottomWidth: 0
                };
                let focusedRouteName = navigation.state.routes[navigation.state.index].routeName;
                if (focusedRouteName === 'Me') {
                    // options.headerTitle = "我";
                    /* options.headerRight = (
                     *     <View style={{ marginRight: 10 }}>
                     *         <TouchableOpacity onPress={() => logout(navigation)}>
                     *             <FixedText style={{ color: 'red', fontSize: RFValue(15) }}>
                     *                 退出
                     *         </FixedText>
                     *         </TouchableOpacity>
                     *     </View>
                     * );*/
                } else if (focusedRouteName === 'Friends') {
                    // options.header = null;
                } else if (focusedRouteName == 'Houses') {
                    options.header = null;
                }

                /* options.headerLeft = (
                 *     <Button
                 *         title="< 🌏"
                 *         onPress={() => {
                 *             navigation.navigate('Map');
                 *         }}
                 *     />
                 * );*/
                return options;
            },
        },
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
    let iconName = '';

    if (routeName === 'Me') {
        iconName = "ios-contact";
    } else if (routeName === 'Friends') {
        iconName = 'ios-contacts';
    } else if (routeName === 'Houses') {
        iconName = 'ios-home';
    } else {
        iconName = 'md-help';
    }

    return <IconComponent name={iconName} size={25} color={tintColor} />;
};