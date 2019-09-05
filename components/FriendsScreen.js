import React, { Component } from 'react';
import { Picker, StyleSheet, Image, View, TouchableOpacity, Text } from 'react-native';


export default class FriendsScreen extends Component {

    state = {
        language: 'java'
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