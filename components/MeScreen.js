import React, { Component } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Text } from 'react-native';


export default class MeScreen extends Component {

    constructor() {
        super();
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>It's me</Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});