import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, ScrollView } from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";

export default class InfoScreen extends Component {

    state = {
        info: ""
    }

    constructor() {
        super();
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button
                    onPress={() => {
                        BackgroundGeolocation.getState(state => {
                            this.setState({
                                info: JSON.stringify(state, null, 2)
                            });
                        });
                    }}
                    title="BackgroundGeoLocation Info"
                />
                <ScrollView>
                    <Text>{this.state.info}</Text>
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({

});