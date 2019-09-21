import React from 'react';
import {
    View,
    ActivityIndicator,
    StatusBar,
    Text,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen'
export default class AuthLoadingScreen extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            SplashScreen.hide();
            this._bootstrapAsync();
        }, 3000);
    }


    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('userId');
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
                <Text style={{ top: 10 }}>初始化中</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});