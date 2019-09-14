import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Switch,
} from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";
import { enableBackgroundGeoLocation, disableBackgroundGeoLocation } from '../utils/Utils';

export default class SettingsScreen extends Component {

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
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                <View style={{ paddingLeft: 5, paddingRight: 5, top: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ alignSelf: 'flex-start', fontSize: 20 }}>BackgroundGeoLocation:</Text>
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
            </View>
        );
    }
}


const styles = StyleSheet.create({

});