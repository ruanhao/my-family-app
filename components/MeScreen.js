import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity,
    Button,
    Text,
} from 'react-native';
import { disableBackgroundGeoLocation } from '../utils/Utils';
import { info } from '../utils/LogUtils';
import BackgroundFetch from "react-native-background-fetch";

export default class MeScreen extends Component {

    static navigationOptions = {
        tabBarLabel: '我'
    };

    constructor() {
        super();
    }

    _signOutAsync = async () => {
        BackgroundFetch.stop(() => {
            info("BackgroundFetch is SHUTDOWN");
        });
        disableBackgroundGeoLocation(async () => {
            info("Signing out!");
            await AsyncStorage.clear();
            this.props.navigation.navigate('AuthLoading');
        });


    }


    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>It's me</Text>
                <Button title="Actually, sign me out :)" onPress={this._signOutAsync} />
            </View>
        );
    }
}


const styles = StyleSheet.create({

});