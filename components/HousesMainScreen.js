import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    FlatList,
    Text,
    ScrollView,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FETCH_HOUSES_URL } from '../utils/Constants';
import { getUserIdAsync, downloadAndGetImageUrl, normalize } from '../utils/Utils';
import { error } from '../utils/LogUtils';
import { SwipeableFlatList } from 'react-native-swipeable-flat-list';
import { Avatar, SearchBar, CheckBox } from 'react-native-elements';
import Octicons from "react-native-vector-icons/Octicons";
import { Dropdown } from 'react-native-material-dropdown';

const HEIGHT = 100;
const WIDTH = 120;

const SOLDOUT_IMAGE = require('../assets/soldout.jpg');

export default class HousesMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerTitle: "房源信息"
    });

    state = {
        checked: false,
        houses: [],
        params: {
            showaAll: false,
            areaName: '',
        },
        sort: 'areaName,asc',
        distinctAreaNames: [],
    }

    _fetchHouses = async () => {
        try {
            let url = FETCH_HOUSES_URL + "?";
            const { params: { showAll, areaName }, sort } = this.state;
            if (showAll) {
                url += "showAll=true&";
            }
            if (areaName) {
                url += `areaName=${areaName}&`;
            }
            if (sort) {
                url += `sort=${sort}`;
            }
            console.log("fetch houses url: ", url);

            let response = await fetch(url,
                {
                    method: 'GET',
                }
            );
            if (!response.ok) {
                error("Error reposne for fetching houses: " + JSON.stringify(response));
                return;
            }
            let responseJson = await response.json();
            let distinctAreaNames = responseJson.areaNames;
            let houses = responseJson.houses;
            console.log("HouseMainScreen.houses: ", houses);
            this.setState({ houses, distinctAreaNames });
        } catch (e) {
            error("Error when get houses: " + e.message);
        }
    }

    componentDidMount = async () => {
        this._fetchHouses();
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

    _sort = async (value) => {
        this.setState({ sort: value }, this._fetchHouses);
    }

    _selectAreaName = async (value) => {
        this.setState({
            params: {
                areaName: value,
                showAll: this.state.params.showAll,
            }
        }, this._fetchHouses);
    }

    _renderHeader = () => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                backgroundColor: 'white',
                alignItems: 'center',
                paddingLeft: 5
            }}>
                <View style={{ flex: 3, marginRight: 3, }}>
                    <Dropdown
                        dropdownOffset={{ top: 20, left: 5 }}
                        label='排序'
                        value=""
                        dropdownPosition={0}
                        itemCount={10}
                        onChangeText={this._sort}
                        data={[
                            { label: '默认排序', value: "" },
                            { label: '小区升序', value: "areaName" },
                            { label: '小区降序', value: "areaName,desc" },
                            { label: '价格升序', value: "price" },
                            { label: '价格降序', value: "price,desc" },
                            { label: '面积升序', value: "info.area" },
                            { label: '面积降序', value: "info.area,desc" },
                        ]}
                    />
                </View>

                <View style={{ flex: 3 }}>
                    <Dropdown
                        dropdownOffset={{ top: 20, left: 5 }}
                        label='小区'
                        value=""
                        dropdownPosition={0}
                        itemCount={10}
                        onChangeText={this._selectAreaName}
                        data={[
                            { label: '所有小区', value: "" },
                            ...this.state.distinctAreaNames.map(name => { return { label: name, value: name } })
                        ]}
                    />
                </View>
                <View style={{ flex: 4 }}>
                    <CheckBox
                        left
                        iconRight
                        containerStyle={{
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            paddingTop: 20,
                            alignSelf: 'flex-end'
                        }}
                        title='包含下架房源'
                        checked={this.state.checked}
                        onPress={() => this.setState({
                            checked: !this.state.checked,
                            params: {
                                showAll: !this.state.checked,
                                areaName: this.state.params.areaName,
                            }
                        }, this._fetchHouses)}
                    />
                </View>
            </View>

        );
    };

    _renderItem = ({ item: house }) => {
        let avatarSource = { cache: 'force-cache' };
        if (house.coverImageUrl) {
            avatarSource.uri = house.coverImageUrl;
        }
        if (!house.available) {
            avatarSource = SOLDOUT_IMAGE;
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
                <FlatList
                    data={this.state.houses}
                    renderItem={this._renderItem}
                    backgroundColor={'transparent'}
                    keyExtractor={(item, index) => item.houseCode}
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
        // paddingTop: 20,
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
        fontSize: normalize(9),
        color: 'gray',
        marginTop: 3,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flex: 1,
        marginTop: 3,
    },
    price: {
        fontSize: normalize(10),
        color: 'orange',
        fontWeight: 'bold'
    },
    priceAverage: {
        fontSize: normalize(9),
        color: 'gray',
        marginLeft: 10,
    }
});