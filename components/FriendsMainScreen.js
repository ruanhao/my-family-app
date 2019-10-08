import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FETCH_USER_URL } from '../utils/Constants';
import { getUserIdAsync } from '../utils/Utils';
import { error } from '../utils/LogUtils';
import { SwipeableFlatList } from 'react-native-swipeable-flat-list';
import { Avatar } from 'react-native-elements';

const HEIGHT = 70;

export default class FriendsMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerStyle: {
            borderBottomWidth: 0,
        },
        /* headerLeft: (
         *     <Button
         *         title="< 🌏"
         *         onPress={() => {
         *             navigation.navigate('Map');
         *         }}
         *     />
         * ),*/

        headerRight: (
            <Button
                onPress={() => {
                    navigation.navigate('QRScannerScreen');
                }}
                title="➕"
                color="gray"
            />
        ),
        headerBackTitle: '👬'
    });

    state = {
        user: {},
        refreshing: false
    }

    constructor() {
        super();
    }

    _onDidFocus = async () => {
        try {
            let userId = await getUserIdAsync();
            let response = await fetch(`${FETCH_USER_URL}/${userId}`,
                {
                    method: 'GET',
                }
            );
            let responseJson = await response.json();
            this.setState({ user: responseJson });
        } catch (e) {
            error("Error when get user: " + e.message);
        }
    }

    _renderRight = ({ item }) => {
        return (
            <TouchableOpacity
                style={{
                    height: HEIGHT,
                    width: HEIGHT,
                }}
            >
                <View
                    style={{
                        backgroundColor: 'red',
                        borderWidth: 0,
                        flex: 1,
                        justifyContent: 'center',
                        padding: 8,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                        }}
                    >
                        删除
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    _renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={{
                    height: HEIGHT,
                    // backgroundColor: 'pink',
                }}
            >

                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                >
                    <View style={{
                        // backgroundColor: 'yellow'
                    }}
                    >
                        <Avatar
                            size="medium"
                            icon={{ name: 'user', type: 'font-awesome' }}
                            rounded
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                    </View>
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            // backgroundColor: 'green',
                            borderColor: 'grey',
                            borderBottomWidth: 0.5,
                            flex: 1,
                            justifyContent: 'center',
                            padding: 8,
                            marginLeft: 5,
                            height: HEIGHT,
                        }}
                    >
                        <Text
                            style={{
                                backgroundColor: 'transparent',
                                color: 'black',
                                fontSize: 20,
                            }}
                        >
                            {item.nickname}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    render() {
        const data = [
            { key: "1", label: 'Label 1', leftLabel: 'Left 1', rightLabel: 'Right 1' },
            { key: "2", label: 'Label 2', leftLabel: 'Left 2', rightLabel: 'Right 2' },
            { key: "3", label: 'Label 3', leftLabel: 'Left 3', rightLabel: 'Right 3' },
            { key: "4", label: 'Label 4', leftLabel: 'Left 4', rightLabel: 'Right 4' },
            { key: "5", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "6", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "7", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "8", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "9", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "10", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "11", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
            { key: "12", label: 'Label 5', leftLabel: 'Left 5', rightLabel: 'Right 5' },
        ];
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onDidFocus={payload => this._onDidFocus(payload)}
                />
                {/*<ScrollView>
                  *  <Text>
                  *      {JSON.stringify(this.state.user, null, 2)}
                  *  </Text>
                * </ScrollView>
                    */}

                <SwipeableFlatList
                    onRefresh={() => {
                        console.log("refresh");
                        this.setState({ refreshing: true });
                        setTimeout(() => { this.setState({ refreshing: false }) }, 3000);
                    }}
                    refreshing={this.state.refreshing}
                    data={this.state.user.friends || []}
                    renderItem={this._renderItem}
                    renderRight={this._renderRight}
                    backgroundColor={'white'}
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
        backgroundColor: '#F5FCFF',
    },
});