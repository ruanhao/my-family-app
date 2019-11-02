import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList,
} from 'react-native';
import { FETCH_AQ_URL } from '../utils/Constants';
import { error, info } from '../utils/LogUtils';
import Octicons from "react-native-vector-icons/Octicons";
import FixedText from "./FixedText";
import { RFValue } from "react-native-responsive-fontsize";

const HEIGHT = 70;

export default class CitiesAirQualityScreen extends Component {

    state = {
        cities: []
    }

    constructor() {
        super();
    }


    componentDidMount = async () => {
        try {
            let response = await fetch(FETCH_AQ_URL, { method: 'GET' });
            let responseJson = await response.json();
            this.setState({ cities: responseJson });
        } catch (e) {
            error("Error when fetching air quality for all cities: " + e.message);
        }
    }

    _getAirQualityLevel = (aqi) => {
        if (aqi <= 50) {
            return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'green', color: 'white' }}>一级 (优)</FixedText>);
        }
        if (aqi <= 100) {
            return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'gold', color: 'black' }}>二级 (良)</FixedText>);
        }
        if (aqi <= 150) {
            return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'orange', color: 'white' }}>轻度污染</FixedText>);
        }
        if (aqi <= 200) {
            return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'red', color: 'white' }}>中度污染</FixedText>);
        }
        if (aqi <= 300) {
            return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'purple', color: 'white' }}>重度污染</FixedText>);
        }
        return (<FixedText style={{ ...styles.aqLabel, backgroundColor: 'firebrick', color: 'white' }}>严重污染</FixedText>);


    }

    _renderItem = ({ item: { name, aqi, latestUpdateDate } }) => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,

            }}
            >
                <View style={{ flex: 2 }}>
                    <FixedText style={styles.cityName} >{name}</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    <FixedText style={styles.aqi}>{aqi}</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    {this._getAirQualityLevel(aqi)}
                </View>
                <View style={{ flex: 2 }}>
                    <FixedText style={styles.updateDate}>{latestUpdateDate}</FixedText>
                </View>

            </View>
        );
    }

    _renderHeader = () => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 20,
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderColor: 'lightgray',
                marginHorizontal: 20,
            }}
            >
                <View style={{ flex: 2 }}>
                    <FixedText style={styles.header} >城市</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    <FixedText style={styles.header}>指数</FixedText>
                </View>
                <View style={{ flex: 1 }}>
                    <FixedText style={styles.header}>等级</FixedText>
                </View>
                <View style={{ flex: 2 }}>
                    <FixedText style={styles.header}>更新时间</FixedText>
                </View>

            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.cities || []}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    backgroundColor={'white'}
                    ListHeaderComponent={this._renderHeader}
                    stickyHeaderIndices={[0]}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        //alignItems: 'center',
        // backgroundColor: '#F5FCFF',
        paddingTop: 20,
    },
    aqi: {
        fontSize: RFValue(10),
        textAlign: 'center',
    },
    aqLabel: {
        fontSize: RFValue(10),
        color: "gray",
        textAlign: 'center',
        marginHorizontal: 5
    },
    cityName: {
        fontSize: RFValue(12),
    },
    header: {
        fontSize: RFValue(12),
        textAlign: 'center',
    },
    updateDate: {
        fontSize: RFValue(10),
        textAlign: 'center',
    }
});