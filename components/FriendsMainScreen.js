import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    HeaderBackButton,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FETCH_USER_URL } from '../utils/Constants';
import { getUserIdAsync } from '../utils/Utils';
import { error } from '../utils/LogUtils';

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
        user: {}
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

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <NavigationEvents
                    onDidFocus={payload => this._onDidFocus(payload)}
                />
                <ScrollView>
                    <Text>
                        {JSON.stringify(this.state.user, null, 2)}
                    </Text>
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});