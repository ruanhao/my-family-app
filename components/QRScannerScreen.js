import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    Dimensions,
    View,
    Alert,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from "react-native-vector-icons/Ionicons";
import { info, error } from '../utils/LogUtils';
import { ADD_FRIEND_URL } from '../utils/Constants';
import { getUserIdAsync } from '../utils/Utils';

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const overlayColor = "rgba(0,0,0,0.5)"; // this gives us a black color with a 50% transparency
const rectDimensions = SCREEN_WIDTH * 0.7; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = SCREEN_WIDTH * 0.0025; // this is equivalent to 2 from a 393 device width
const rectBorderColor = "#fff";
const iconScanColor = "#fff";

export default class QRScannerScreen extends Component {

    state = {

    }

    onSuccess = async ({ data }) => {
        if (!data.match(/^[a-z0-9]*$/)) {
            Alert.alert(
                "数据格式错误",
                data,
                [
                    {
                        text: '再来一次',
                        onPress: () => {
                            this._scanner.reactivate();
                        }
                    },
                    {
                        text: '取消',
                        onPress: () => { this.props.navigation.goBack(); },
                        style: 'cancel',
                    },
                ]
            );
            return;
        }

        try {
            let response = await fetch(`${ADD_FRIEND_URL}/${data}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'USER-ID': await getUserIdAsync(),
                    },
                });
            if (response.status != 200) {
                let responseJson = await response.json();
                Alert.alert(
                    "添加好友失败",
                    responseJson.errorCode,
                    [
                        {
                            text: '再来一次',
                            onPress: () => {
                                this._scanner.reactivate();
                            }
                        },
                        {
                            text: '取消',
                            onPress: () => { this.props.navigation.goBack(); },
                            style: 'cancel',
                        },
                    ]
                );
                return;
            }
            this.props.navigation.goBack();
        } catch (e) {
            error(`Error when add friend ${data}: ${e.message}`);
            Alert.alert(
                "内部错误",
                e.message,
                [
                    {
                        text: '再来一次',
                        onPress: () => {
                            this._scanner.reactivate();
                        }
                    },
                    {
                        text: '取消',
                        onPress: () => { this.props.navigation.goBack(); },
                        style: 'cancel',
                    },
                ]
            );
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <QRCodeScanner
                    ref={(ref) => { this._scanner = ref }}
                    showMarker
                    onRead={this.onSuccess}
                    cameraStyle={{ height: SCREEN_HEIGHT * 0.85 }}
                    customMarker={
                        <View style={styles.rectangleContainer}>
                            <View style={styles.rectangle}>
                                <Icon
                                    name="ios-qr-scanner"
                                    size={SCREEN_WIDTH * 0.7}
                                    color={iconScanColor}
                                />
                            </View>
                        </View>
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    rectangleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    rectangle: {
        height: rectDimensions,
        width: rectDimensions,
        borderWidth: rectBorderWidth,
        borderColor: rectBorderColor,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
    },
    content: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
});
