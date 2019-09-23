import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { info, error } from '../utils/LogUtils';
import {
    Alert,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Switch,
} from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";
import { enableBackgroundGeoLocation, disableBackgroundGeoLocation } from '../utils/Utils';

const settingTitles = {
    background: '后台',
    geoLocationUpdate: '地理位置上报',
};

export default class SettingsScreen extends Component {

    static navigationOptions = {
        tabBarLabel: '设置'
    };

    state = {
        // enableBackgroundGeoLocation: false,
    }

    constructor() {
        super();
        this._checkBackgroundGeoLocation();
    }

    _checkBackgroundGeoLocation = () => {
        BackgroundGeolocation.getState(({ enabled }) => {
            this.setState({ enableBackgroundGeoLocation: enabled });
        })
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'flex-start', paddingVertical: 30, backgroundColor: 'whitesmoke' }}>
                <Text style={{ color: 'grey', marginLeft: 5 }}>{settingTitles.background}</Text>
                <View style={{ ...styles.configSection }}>
                    <Text style={{ ...styles.configSectionItemKey }}>
                        📤 {' '} {settingTitles.geoLocationUpdate}
                    </Text>
                    <Switch style={{ alignSelf: 'flex-end' }}
                        disabled={!('enableBackgroundGeoLocation' in this.state)}
                        value={this.state.enableBackgroundGeoLocation}
                        onValueChange={enabled => {
                            if (enabled) {
                                enableBackgroundGeoLocation(this._checkBackgroundGeoLocation);
                            } else {
                                disableBackgroundGeoLocation(this._checkBackgroundGeoLocation);
                            }
                        }}
                    />
                </View>

                {/*
                <View style={{ flex: 20, justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={this._signOutAsync}>
                        <View style={{ ...styles.configSection, justifyContent: 'center', backgroundColor: 'lightpink' }}>
                            <Text style={{ ...styles.configSectionItemKey }}>
                                退出登陆
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                */}
            </View>
        );
    }

    _signOutAsync = async () => {

        Alert.alert(
            '确定退出登陆',
            '',
            [
                {
                    text: '确定',
                    onPress: () => {
                        disableBackgroundGeoLocation(async () => {
                            info("Signing out!");
                            await AsyncStorage.clear();
                            this.props.navigation.navigate('AuthLoading');
                        });
                    }
                },
                {
                    text: '取消',
                    onPress: () => { },
                    style: 'cancel',
                },
            ],
            { cancelable: false },
        );

    }
}


const styles = StyleSheet.create({
    configSection: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        paddingVertical: 10,
        backgroundColor: 'white',
        paddingLeft: 5,
        paddingRight: 5,
        top: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    configSectionItemKey: {
        alignSelf: 'flex-start',
        fontSize: 23,
        marginTop: 3
    }
});