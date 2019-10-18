import React, { Component } from 'react';

import {
    StyleSheet,
    Button,
    Text,
    Dimensions,
    View,
    Alert,
} from 'react-native';
import { info, error } from '../utils/LogUtils';
import { getAvatarImageUri } from '../utils/Constants';
import { Avatar } from 'react-native-elements';
import Gallery from 'react-native-image-gallery';

export default class HouseScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerStyle: {
            borderBottomWidth: 0,
        },
    });

    state = {
        house: {},
    }

    componentDidMount() {
        const { navigation } = this.props;
        const house = navigation.getParam('house');
        console.log("HouseScreen.house: ", house);
        this.setState({ house });
    }

    render() {
        const { gallery } = this.state.house;
        // console.log("HouseScreen.gallery: ", gallery);
        if (!gallery) {
            return null;
        }
        let sources = gallery.map(url => ({
            source: { uri: url },
            dimensions: { width: 400, height: 300 }
        }));
        console.log("sources: ", sources);
        return (
            <View style={styles.container}>
                <View style={{ flex: 4 }}>
                    <Gallery
                        style={{ flex: 1, backgroundColor: 'white' }}
                        images={sources}
                    />
                </View>

                <View style={{ flex: 6, marginTop: 30 }}>
                    <Text style={styles.h1}>{this.state.house.areaName} ({this.state.house.price}万)</Text>
                    <Text style={styles.h2}>{this.state.house.title}</Text>
                    <Text style={styles.h2}>{this.state.house.info.summary}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    h1: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    h2: {
        fontSize: 18,
        color: "gray",
        marginBottom: 5,
    },

});
