import React, { Component } from 'react';

import {
    StyleSheet,
    Button,
    Text,
    TouchableOpacity,
    Dimensions,
    View,
    Alert,
    Linking,
} from 'react-native';
import { info, error } from '../utils/LogUtils';
import { getAvatarImageUri } from '../utils/Constants';
import { Avatar } from 'react-native-elements';
import Gallery from 'react-native-image-gallery';

const NO_IMAGE = require('../assets/no-image.png');
const IMAGE_DIMENSION = { width: 400, height: 300 }

export default class HouseScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerStyle: {
            borderBottomWidth: 0,
        },
    });

    state = {
        house: null,
    }

    componentDidMount() {
        const { navigation } = this.props;
        const house = navigation.getParam('house');
        console.log("HouseScreen.house: ", house);
        this.setState({ house });
    }

    _openUrl = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                error("Don't know how to open URI: " + url);
            }
        });
    };

    render() {
        let house = this.props.navigation.getParam("house");
        if (!house) {
            return null;
        }
        console.log("HouseScreen.render().house: ", house);
        const { url, houseCode, gallery, info: { summary }, areaName, title, price, priceHistory } = house;
        let sources = [{ source: NO_IMAGE, dimensions: IMAGE_DIMENSION }];
        if (gallery && gallery.length > 0) {
            sources = gallery.map(url => ({
                source: { uri: url },
                dimensions: IMAGE_DIMENSION,
            }));
        }
        return (
            <View style={styles.container}>
                <View style={{ flex: 4 }}>
                    <Gallery
                        style={{ flex: 1, backgroundColor: 'white' }}
                        images={sources}
                    />
                </View>

                <View style={{ flex: 6, marginTop: 30, padding: 10 }}>
                    <Text style={styles.h1}>{areaName} ({price}万)</Text>
                    <Text style={{ ...styles.h2, fontWeight: 'bold', marginBottom: 30, }}>{title}</Text>
                    <Text style={{ fontWeight: 'bold', color: 'blue', fontSize: 20 }}>房源编号:</Text>
                    <Text selectable style={styles.h2}>{houseCode}</Text>
                    <Text style={{ fontWeight: 'bold', color: 'blue', fontSize: 20 }}>基本信息:</Text>
                    <Text style={styles.h2}>{summary}</Text>
                    <Text style={{ fontWeight: 'bold', color: 'blue', fontSize: 20 }}>历史价格:</Text>
                    <Text style={styles.h2}>{priceHistory.map(({ date, price }) => `${date} => ${price}`).join('\n')}</Text>
                    <TouchableOpacity onPress={() => this._openUrl(url)}>
                        <Text style={{ fontWeight: 'bold', color: 'orange', fontSize: 22 }}>👉 点击获取详细信息</Text>
                    </TouchableOpacity>
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
