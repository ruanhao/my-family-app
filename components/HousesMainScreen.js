import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FETCH_HOUSES_URL } from '../utils/Constants';
import { getUserIdAsync, downloadAndGetImageUrl, normalize } from '../utils/Utils';
import { error } from '../utils/LogUtils';
import { SwipeableFlatList } from 'react-native-swipeable-flat-list';
import { Avatar } from 'react-native-elements';
import Octicons from "react-native-vector-icons/Octicons";

const HEIGHT = 90;
const WIDTH = 120;

export default class HousesMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
    });

    state = {
        houses: [],
    }


    componentDidMount = async () => {
        try {
            let response = await fetch(FETCH_HOUSES_URL,
                {
                    method: 'GET',
                }
            );
            if (!response.ok) {
                error("Error reposne for fetching houses: " + JSON.stringify(response));
                return;
            }
            let houses = await response.json();
            console.log("HouseMainScreen.houses: ", houses);
            this.setState({ houses });
        } catch (e) {
            error("Error when get houses: " + e.message);
        }
    }

    _avatar = (source) => {
        return (
            <Avatar
                width={WIDTH}
                height={HEIGHT - 5}
                size="medium"
                icon={{ name: 'home', type: 'font-awesome' }}
                activeOpacity={0.7}
                source={source}
            />
        );
    }

    _renderItem = ({ item: house }) => {
        let avatarSource = { cache: 'force-cache' };
        if (house.coverImageUrl) {
            avatarSource.uri = house.coverImageUrl;
        }
        const { areaName, price, info: { type, area, direction, floor } } = house;
        let priceAverage = Math.round(price * 10000 / area);
        return (
            <TouchableOpacity
                onPress={() => this.props.navigation.navigate('HouseScreen', {
                    house
                })}
                style={{ height: HEIGHT }}>
                <View style={styles.item}>
                    <View style={{ marginLeft: 10 }} >
                        {this._avatar(avatarSource)}
                    </View>
                    <View style={styles.infoContainer} >
                        <Text style={styles.title}>{house.title}</Text>
                        <Text style={styles.subtitle}>
                            {`${areaName}/${type}/${area}/${direction}/${floor}`}
                        </Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{price}万</Text>
                            <Text style={styles.priceAverage}>{priceAverage}元/平</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    render() {
        return (
            <View style={styles.container}>
                <SwipeableFlatList
                    data={this.state.houses}
                    renderItem={this._renderItem}
                    backgroundColor={'white'}
                    keyExtractor={(item, index) => item.houseCode}
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
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        backgroundColor: 'transparent',
        flex: 1,
        borderColor: 'grey',
        borderBottomWidth: 0.5,
        alignItems: 'flex-start',
        padding: 8,
        marginLeft: 5,
        marginRight: 10,
        height: HEIGHT,
        // flexDirection: 'row',
    },
    title: {
        fontSize: normalize(10),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: normalize(8),
        color: 'gray',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 3,
    },
    price: {
        fontSize: normalize(9),
        color: 'orange',
        fontWeight: 'bold'
    },
    priceAverage: {
        fontSize: normalize(8),
        color: 'gray',
        marginLeft: 10,
    }
});