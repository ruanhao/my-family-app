import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, ScrollView } from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";
import { info, latestFootprints } from '../utils/Utils';
// import { NavigationEvents } from 'react-navigation';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import VersionNumber from 'react-native-version-number';

const msg = {
    debugTitle: '选择调试信息🔧',
    backgroundLocationInfo: '后台位置更新信息',
    backgroundLocationLog: '后台位置更新日志',
    latestFootprints: '我的足迹',
    versionInfo: '版本信息',
};

export default class InfoScreen extends Component {

    static navigationOptions = {
        tabBarLabel: '信息'
    };

    state = {
        info: ""
    }

    constructor() {
        super();
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Menu
                    ref={ref => { this._menu = ref }}
                    button={<Button onPress={() => { this._menu.show() }} title={msg.debugTitle} />}
                >
                    <MenuItem onPress={() => {
                        this._menu.hide();
                        this.setState({
                            info: `App version: ${VersionNumber.appVersion}\nBuild version: ${VersionNumber.buildVersion}`
                        });
                    }}>
                        {msg.versionInfo}
                    </MenuItem>

                    <MenuItem onPress={() => {
                        this._menu.hide();
                        BackgroundGeolocation.getState(state => {
                            this.setState({
                                info: JSON.stringify(state, null, 2)
                            });
                        });
                    }}>
                        {msg.backgroundLocationInfo}
                    </MenuItem>

                    <MenuItem onPress={() => {
                        this._menu.hide();
                        BackgroundGeolocation.getLog(log => {
                            this.setState({
                                info: log
                            });
                        })
                    }}>
                        {msg.backgroundLocationLog}
                    </MenuItem>

                    <MenuDivider />

                    <MenuItem onPress={async () => {
                        this._menu.hide();
                        let content = (await latestFootprints()).content;
                        let footprintsStr = content.map(({ date, speed, heading, altitude, latitude, longitude }) => {
                            // return `${date} - (${latitude}, ${longitude}), speed: ${speed}, altitude: ${altitude}, heading: ${heading}`;
                            return `${date} - ${speed}`;
                        }).join('\n');
                        this.setState({ info: footprintsStr });
                    }}>
                        {msg.latestFootprints}
                    </MenuItem>

                </Menu>

                <ScrollView
                    ref={ref => this._scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this._scrollView.scrollToEnd({ animated: true });
                    }}
                >
                    <Text selectable>{this.state.info}</Text>
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});