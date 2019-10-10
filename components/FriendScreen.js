import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    Dimensions,
    View,
    Alert,
} from 'react-native';
import { info, error } from '../utils/LogUtils';

export default class FriendScreen extends Component {

    state = {

    }



    render() {
        const { navigation } = this.props;
        const userId = navigation.getParam('userId');
        return (
            <View style={styles.container}>
                <Text>{userId}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
