import React, { Component } from 'react';
import {
    StyleSheet,
    Button,
    Image,
    View,
    TouchableOpacity,
    ActivityIndicator,
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
import FixedText from "./FixedText";
import { RFValue } from "react-native-responsive-fontsize";

const HEIGHT = 100;
const WIDTH = 120;

const SOLDOUT_IMAGE = require('../assets/soldout.jpg');

export default class HousesMainScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerTitle: "房源信息"
    });

    state = {
        loading: false,
        checked: false,
        houses: [],
        params: {
            showaAll: false,
            areaName: '',
        },
        sort: 'areaName,asc',
        areasInfo: [],
        total: 0, // 在售房源总数
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
            this.setState({ loading: true })
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
            let areasInfo = responseJson.areasInfo; // [{name: "xxx", count: 3}]
            let houses = responseJson.houses;
            let total = responseJson.total;
            console.log("total: ", total);
            console.log("HouseMainScreen.houses: ", houses);
            this.setState({ houses, areasInfo, total, loading: false });
        } catch (e) {
            this.setState({ loading: false });
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
                paddingLeft: 10
            }}>
                <View style={{ flex: 30, marginRight: 3, }}>
                    <Dropdown
                        dropdownOffset={{ top: 20, left: 5 }}
                        label='排序'
                        value=""
                        fontSize={RFValue(10)}
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

                <View style={{ flex: 40 }}>
                    <Dropdown
                        dropdownOffset={{ top: 20, left: 5 }}
                        label='小区'
                        value=""
                        fontSize={RFValue(10)}
                        dropdownPosition={0}
                        itemCount={10}
                        onChangeText={this._selectAreaName}
                        data={[
                            { label: `所有小区 (${this.state.total})`, value: "" },
                            ...this.state.areasInfo.map(({ name, count }) => { return { label: `${name} (${count})`, value: name } })
                        ]}
                    />
                </View>
                <View style={{ flex: 30, }}>
                    <CheckBox
                        left
                        size={15}
                        iconRight={false}
                        containerStyle={{
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            paddingTop: 20,
                            alignSelf: 'flex-end'
                        }}
                        title='包含下架'
                        textStyle={{ fontSize: RFValue(8) }}
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
                        <FixedText style={styles.title}>{house.title}</FixedText>
                        <FixedText style={styles.subtitle}>
                            {`${areaName}/${type}/${area}/${direction}/${floor}`}
                        </FixedText>
                        <View style={styles.priceContainer}>
                            <FixedText style={styles.price}>{price}万</FixedText>
                            <FixedText style={styles.priceAverage}>{priceAverage}元/平</FixedText>
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
                {this.state.loading &&
                    <View style={styles.loading}>
                        <ActivityIndicator size='large' />
                    </View>
                }
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
        fontSize: RFValue(12),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: RFValue(10),
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
        fontSize: RFValue(11),
        color: 'orange',
        fontWeight: 'bold'
    },
    priceAverage: {
        fontSize: RFValue(9),
        color: 'gray',
        marginLeft: 10,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    }
});