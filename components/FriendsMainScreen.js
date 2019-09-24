import React, { Component } from 'react';
import {
    Picker,
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    Text,
    HeaderBackButton,
} from 'react-native';


export default class FriendsMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        /* headerStyle: {
         *     borderBottomWidth: 0,
         * },*/
        headerLeft: (
            <Button
                title="< 🌏"
                onPress={() => {
                    navigation.navigate('Map');
                }}
            />
        ),
        headerRight: (
            <Button
                onPress={() => {
                    navigation.navigate('QRScannerScreen');
                }}
                title="[-]"
                color="gray"
            />
        ),
        // headerBackTitle: '朋友'
    });

    state = {
    }

    constructor() {
        super();
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Picker
                    selectedValue={this.state.language}
                    style={{ height: 50, width: 100 }}
                    onValueChange={(itemValue, itemIndex) =>
                        this.setState({ language: itemValue })
                    }>
                    <Picker.Item label="Java" value="java" />
                    <Picker.Item label="JavaScript" value="js" />
                    <Picker.Item label="Python" value="python" />
                </Picker>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});