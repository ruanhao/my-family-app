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
import { FETCH_USER_URL, getAvatarImageUri } from '../utils/Constants';
import { getUserIdAsync, downloadAndGetImageUrl } from '../utils/Utils';
import { error } from '../utils/LogUtils';
import { SwipeableFlatList } from 'react-native-swipeable-flat-list';
import { Avatar } from 'react-native-elements';
import Octicons from "react-native-vector-icons/Octicons";
import FixedText from "./FixedText";
import { RFValue } from "react-native-responsive-fontsize";

const HEIGHT = 70;

export default class FriendsMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        /* headerStyle: {
         *     borderBottomWidth: 0,
         * },*/
        /* headerLeft: (
         *     <Button
         *         title="< 🌏"
         *         onPress={() => {
         *             navigation.navigate('Map');
         *         }}
         *     />
         * ),*/
        // headerTitle: "朋友",
        /* headerRight: (
         *     <Button
         *         onPress={() => {
         *             navigation.navigate('QRScannerScreen');
         *         }}
         *         title="➕"
         *         color="gray"
         *     />
         * ),
         * headerBackTitle: '👬'*/
    });

    state = {
        user: {},
        refreshing: false
    }

    constructor() {
        super();
    }

    _onDidFocus = () => { }

    componentDidMount = async () => {
        try {
            let userId = await getUserIdAsync();
            let response = await fetch(`${FETCH_USER_URL}/${userId}`,
                {
                    method: 'GET',
                }
            );
            let responseJson = await response.json();
            if (responseJson.friends) {
                for (let friend of responseJson.friends) {
                    if (friend.avatarImageId) {
                        let imageUri = getAvatarImageUri(friend.avatarImageId);
                        let { uri } = await downloadAndGetImageUrl(friend.avatarImageId, imageUri);
                        friend.avatarImageUri = uri;
                    }
                }
            }
            // console.log(responseJson.friends);
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
                        alignItems: 'center',
                        padding: 8,
                    }}
                >
                    <FixedText
                        style={{
                            fontSize: RFValue(20),
                        }}
                    >
                        删除
                    </FixedText>
                </View>
            </TouchableOpacity>
        );
    }

    _renderItem = ({ item }) => {
        let avatarSource = { cache: 'force-cache' };
        if (item.avatarImageUri) {
            avatarSource.uri = item.avatarImageUri;
        }
        return (
            <TouchableOpacity
                onPress={() => this.props.navigation.navigate('FriendScreen', {
                    user: item
                })}
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
                        marginLeft: 10,
                    }}
                    >
                        <Avatar
                            size="medium"
                            icon={{ name: 'user', type: 'font-awesome' }}
                            rounded
                            source={avatarSource}
                            activeOpacity={0.7}
                        />
                    </View>
                    <View
                        style={{
                            backgroundColor: 'transparent',
                            flex: 1,
                            borderColor: 'grey',
                            borderBottomWidth: 0.5,
                            alignItems: 'center',
                            padding: 8,
                            marginLeft: 5,
                            marginRight: 10,
                            height: HEIGHT,
                            flexDirection: 'row',
                        }}
                    >

                        <FixedText
                            style={{
                                flex: 3,
                                fontSize: RFValue(18),
                            }}
                        >
                            {item.nickname}
                        </FixedText>
                        {item.address && (
                            <View style={{ flex: 7, flexDirection: 'row', }}>
                                <FixedText style={{
                                    color: 'lightgray',
                                    fontSize: RFValue(12),
                                    flex: 9,
                                    textAlign: 'right',
                                    marginRight: 10,
                                }}
                                >
                                    {item.address}
                                </FixedText>

                                <Octicons
                                    style={{ alignSelf: 'flex-end' }}
                                    name="location"
                                    size={15}
                                    color="lightgray"
                                />

                            </View>
                        )}


                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    render() {
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
        // backgroundColor: '#F5FCFF',
        paddingTop: 20,
    },
});