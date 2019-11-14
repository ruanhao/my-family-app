import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList,
} from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import {
    FETCH_NOTIFICAIONS_URL,
    ACK_NOTIFICAIONS_URL,
    ACK_ALL_NOTIFICAIONS_URL,
} from '../utils/Constants';
import { error, info } from '../utils/LogUtils';
import Octicons from "react-native-vector-icons/Octicons";
import FixedText from "./FixedText";
import { getUserIdAsync } from "../utils/Utils";
import { RFValue } from "react-native-responsive-fontsize";
import PushNotificationIOS from "@react-native-community/push-notification-ios";

const HEIGHT = 70;

export default class NotificationScreen extends Component {

    state = {
        page: 0,
        ack: false,
        isRefreshing: false,
        isLoading: false,
        notifications: []
    }

    constructor() {
        super();
    }

    _ackAll = async () => {
        try {
            let response = await fetch(ACK_ALL_NOTIFICAIONS_URL,
                {
                    method: 'POST',
                    headers: {
                        'USER-ID': await getUserIdAsync(),
                    }

                });
            if (response.ok) {
                PushNotificationIOS.setApplicationIconBadgeNumber(0);
                this.setState({
                    notifications: [],
                    page: 0,
                }, this._loadNotifications);
            }
        } catch (e) {
            error("Error when acking all notificaitons: " + e.message);
        }
    }

    _loadNotifications = async () => {
        const { notifications, page, ack } = this.state;
        this.setState({ isLoading: true });
        let url = FETCH_NOTIFICAIONS_URL + "?page=" + page;
        /* if (ack != null) {
         *     url += ("&ack=" + ack);
         * }*/
        try {
            let response = await fetch(url,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'USER-ID': await getUserIdAsync(),
                    }

                });
            let responseJson = await response.json();
            this.setState({
                notifications: page === 1 ? responseJson.content : [...notifications, ...responseJson.content],
                totalPages: responseJson.totalPages,
                totalElements: responseJson.totalElements,
            });
        } catch (e) {
            error("Error when fetching notificaitons: " + e.message);
        } finally {
            this.setState({ isLoading: false, isRefreshing: false });
        }

    }

    componentDidMount = () => {
        this._loadNotifications();
    }

    _renderItem = ({ item: { id, title, body, ack, createdDate } }) => {
        return (
            <View style={{
                flex: 1,
                // flexDirection: 'row',
                // alignItems: 'center',
                // justifyContent: 'center',
                marginHorizontal: 20,
                marginVertical: 10,
                // paddingLeft: 20,


            }}
            >
                <View style={{ flex: 1 }}>
                    <FixedText style={{ ...styles.notificationTitle, fontWeight: ack ? "normal" : "bold" }}>{title}</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    <FixedText style={{ ...styles.notificationDate }}>{createdDate}</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    <FixedText style={styles.notificationBody}>{body}</FixedText>
                </View>
            </View>
        );
    }

    _renderHeader = () => {
        return (
            <View style={{
                // flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderColor: 'lightgray',
                marginHorizontal: 10,
                marginBottom: 10,
            }}
            >
                <View style={{ flex: 8 }}>
                </View>
                <View style={{ flex: 3 }}>
                    <Button
                        onPress={this._ackAll}
                        title="全部已读"
                        buttonStyle={{ backgroundColor: 'green' }}
                        titleStyle={{ fontSize: RFValue(10) }}
                    />
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ flex: 3 }}>
                    <Button
                        onPress={() => { }}
                        title="清空消息"
                        buttonStyle={{ backgroundColor: 'red' }}
                        titleStyle={{ fontSize: RFValue(10) }}
                    />
                </View>
                {/*<View style={{ flex: 4 }}>
                    <CheckBox
                        left
                        size={RFValue(20)}
                        iconRight={false}
                        containerStyle={{
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            alignSelf: 'flex-end'
                        }}
                        title='显示全部'
                        textStyle={{ fontSize: RFValue(10) }}
                        checked={this.state.ack === null ? true : false}
                        onPress={() => this.setState({
                            ack: this.state.ack === false ? null : false,
                            notifications: [],
                            page: 0,
                        }, this._loadNotifications)}
                    />
                </View>*/}


            </View>
        );
    }

    _handleRefresh = () => {
        this.setState({
            isRefreshing: true,
        }, () => {
            this._loadNotifications();
        });

    }

    _handleLoadMore = () => {
        this.setState({
            page: this.state.page + 1
        }, () => {
            this._loadNotifications();
        });
    }

    render() {
        return (
            <View style={styles.container}>

                {this._renderHeader()}


                <FlatList
                    data={this.state.notifications || []}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    backgroundColor={'white'}
                    // ListHeaderComponent={this._renderHeader}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this._handleRefresh}
                    onEndReached={this._handleLoadMore}
                    onEndReachedThreshold={1}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        //alignItems: 'center',
        // backgroundColor: '#F5FCFF',
        paddingTop: 20,
    },
    notificationTitle: {
        fontSize: RFValue(15),
    },
    notificationDate: {
        fontSize: RFValue(10),
    },
    notificationBody: {
        fontSize: RFValue(12),
        color: "gray",
    },
    header: {
        fontSize: RFValue(12),
        textAlign: 'center',
    },
    updateDate: {
        fontSize: RFValue(10),
        textAlign: 'center',
    }
});