import React, { Component } from 'react';
import {
    StyleSheet,
    Alert,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList,
} from 'react-native';
import {
    Button,
    CheckBox,
    Divider,
    Badge,
} from 'react-native-elements';
import {
    FETCH_NOTIFICATIONS_URL,
    ACK_NOTIFICATIONS_URL,
    ACK_ALL_NOTIFICATIONS_URL,
    DEL_ALL_NOTIFICATIONS_URL,
    DEL_NOTIFICATIONS_URL,
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
        totalPages: 0,
        ack: false,
        isRefreshing: false,
        isLoading: false,
        notifications: [],
        changed: 1,
    }

    constructor() {
        super();
    }

    _ackAll = async () => {
        try {
            let response = await fetch(ACK_ALL_NOTIFICATIONS_URL,
                {
                    method: 'POST',
                    headers: {
                        'USER-ID': await getUserIdAsync(),
                    }

                });
            if (response.ok) {
                PushNotificationIOS.setApplicationIconBadgeNumber(0);
                for (let notification of this.state.notifications) {
                    notification.ack = true;
                }
                this.setState({ changed: this.state.changed + 1 });
            }
        } catch (e) {
            error("Error when acking all notificaitons: " + e.message);
        }
    }

    _loadNotifications = async () => {
        const { notifications, page, ack, totalPages } = this.state;
        this.setState({ isLoading: true });
        let url = FETCH_NOTIFICATIONS_URL + "?page=" + page;
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
                notifications: page === 0 ? responseJson.content : [...notifications, ...responseJson.content],
                totalPages: responseJson.totalPages,
                totalElements: responseJson.totalElements,
                page: (page >= totalPages) ? totalPages - 1 : page,
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

    _deleteNotification = async (notificationId) => {
        try {
            let response = await fetch(DEL_NOTIFICATIONS_URL + "/" + notificationId,
                {
                    method: 'DELETE',
                    headers: {
                        'USER-ID': await getUserIdAsync(),
                    }

                });
            if (response.ok) {
                let responseJson = await response.json();
                let badgeNumber = responseJson.badgeCount;
                PushNotificationIOS.setApplicationIconBadgeNumber(badgeNumber);
                let newNotifications = [];
                for (let notification of this.state.notifications) {
                    if (notification.id != notificationId) {
                        newNotifications.push(notification);
                    }
                }
                this.setState({ changed: this.state.changed + 1, notifications: newNotifications });
            }
        } catch (e) {
            error(`Error when delete notificaiton ${notificationId}: ${e.message}`);
        }
    }

    _ackNotification = async (notificationId) => {
        try {
            let response = await fetch(ACK_NOTIFICATIONS_URL + "/" + notificationId,
                {
                    method: 'POST',
                    headers: {
                        'USER-ID': await getUserIdAsync(),
                    }

                });
            if (response.ok) {
                let responseJson = await response.json();
                let badgeNumber = responseJson.badgeCount;
                PushNotificationIOS.setApplicationIconBadgeNumber(badgeNumber);
                for (let notification of this.state.notifications) {
                    if (notification.id === notificationId) {
                        notification.ack = true;
                        break;
                    }
                }
                this.setState({ changed: this.state.changed + 1 });
            }
        } catch (e) {
            error(`Error when ack notificaiton ${notificationId}: ${e.message}`);
        }
    }

    _deleteAll = () => {
        Alert.alert(
            '确定删除所有消息？',
            '',
            [
                {
                    text: '确定',
                    onPress: async () => {
                        try {
                            let response = await fetch(DEL_ALL_NOTIFICATIONS_URL,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'USER-ID': await getUserIdAsync(),
                                    }
                                });
                            if (response.ok) {
                                PushNotificationIOS.setApplicationIconBadgeNumber(0);
                                this.setState({ changed: this.state.changed + 1, notifications: [], page: 0 });
                            }
                        } catch (e) {
                            error(`Error when delete all notificaitons: ${e.message}`);
                        }
                    },
                },
                {
                    text: "取消",
                    style: 'cancel',
                },
            ],
            { cancelable: false },
        );
    }

    _handlePress = (notificationId, ack) => {
        let readAction = [];
        if (!ack) {
            readAction = [
                {
                    text: '已阅',
                    onPress: () => this._ackNotification(notificationId)
                }
            ];
        }
        Alert.alert(
            '选择你的操作',
            '',
            [
                ...readAction,
                {
                    text: '删除',
                    onPress: () => { this._deleteNotification(notificationId) },
                },
                {
                    text: "返回",
                    style: 'cancel',
                },
            ],
            { cancelable: false },
        );
    }

    _renderItem = ({ item: { id, title, body, ack, createdDate } }) => {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 5, alignItems: 'center' }}>
                <View style={{ marginLeft: 5, flex: 1 }}>
                    {ack ||
                        <Badge status="primary" containerStyle={{}} />
                    }
                </View>
                <View style={{
                    borderBottomColor: 'lightgray',
                    borderBottomWidth: 1,
                    marginRight: 10,
                    paddingBottom: 5,
                    flex: 10,
                }}
                >
                    <TouchableOpacity
                        onPress={() => this._handlePress(id, ack)}
                    >
                        <View style={{ flex: 1 }}>
                            <FixedText style={{ ...styles.notificationTitle }}>{title}</FixedText>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FixedText style={{ ...styles.notificationDate }}>{createdDate}</FixedText>
                        </View>
                        <View style={{ flex: 1 }}>
                            <FixedText style={styles.notificationBody}>{body}</FixedText>
                        </View>
                    </TouchableOpacity>
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
                        disabled={this.state.notifications.length === 0}
                        buttonStyle={{ backgroundColor: 'green' }}
                        titleStyle={{ fontSize: RFValue(10) }}
                    />
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ flex: 3 }}>
                    <Button
                        onPress={this._deleteAll}
                        title="清空消息"
                        disabled={this.state.notifications.length === 0}
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
            page: 0,
        }, () => {
            this._loadNotifications();
        });

    }

    _handleLoadMore = () => {
        if (this.state.isLoading) {
            return;
        }
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

                <Divider style={{ backgroundColor: 'lightgray' }} />

                <FlatList
                    extraData={this.state}
                    data={this.state.notifications || []}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    backgroundColor={'white'}
                    // ListHeaderComponent={this._renderHeader}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this._handleRefresh}
                    onEndReached={this._handleLoadMore}
                    onEndReachedThreshold={0.3}
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
        // paddingTop: 20,
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