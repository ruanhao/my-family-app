import React, { Component } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Text } from 'react-native';


export default class SettingsScreen extends Component {

    constructor() {
        super();
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>SettingsScreen</Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});