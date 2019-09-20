import React from 'react';
import {
    View,
    Button,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: '登录',
    };

    render() {
        return (
            <View style={styles.container}>
                <Button title="Sign in!" onPress={this._signInAsync} />
            </View>
        );
    }

    _signInAsync = async () => {
        // await AsyncStorage.setItem('userId', 'abc');
        this.props.navigation.navigate('App');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});