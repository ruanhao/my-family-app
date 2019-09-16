import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, ScrollView } from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";
import { info } from '../utils/Utils';
// import { NavigationEvents } from 'react-navigation';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

const msg = {
    debugTitle: '选择调试信息',
    backgroundLocationInfo: '后台位置更新信息',
    backgroundLocationLog: '后台位置更新日志',
};

export default class InfoScreen extends Component {

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
                    <MenuItem onPress={(e) => {
                        this._menu.hide();
                        BackgroundGeolocation.getState(state => {
                            this.setState({
                                info: JSON.stringify(state, null, 2)
                            });
                        });
                    }}>
                        {msg.backgroundLocationInfo}
                    </MenuItem>

                    <MenuItem onPress={(e) => {
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

                </Menu>

                <ScrollView
                    ref={ref => this._scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this._scrollView.scrollToEnd({ animated: true });
                    }}
                >
                    <Text>{this.state.info}</Text>
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});