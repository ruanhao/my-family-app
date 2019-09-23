import React, { Component } from 'react';
import {
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Image,
    TouchableHighlight,
    View,
    TouchableOpacity,
    Button,
    Clipboard,
    Text,
} from 'react-native';
import { info } from '../utils/LogUtils';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-community/async-storage';
import QRCode from 'react-native-qrcode-svg';

export default class MeScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            tabBarLabel: '我',
        };
    };

    constructor() {
        super();
    }

    state = {
        userId: null,
        visibleModalId: null,
    };

    showUserId = async () => {
        const userId = await AsyncStorage.getItem('userId');
        this.setState({ visibleModal: 'showUserId', userId: userId });
    }

    showQR = async () => {
        const userId = await AsyncStorage.getItem('userId');
        this.setState({ visibleModal: 'showQR', userId: userId });
    }

    render() {
        return (
            <View style={styles.container}>
                <Button
                    onPress={this.showUserId}
                    title="我的ID"
                />

                <Button
                    onPress={this.showQR}
                    title="我的二维码"
                />

                <Modal
                    animationInTiming={500}
                    animationOutTiming={1000}
                    isVisible={this.state.visibleModal === 'showUserId'}
                    onBackdropPress={() => this.setState({ visibleModal: null })}
                >
                    <View style={styles.content} >
                        <Text style={styles.contentTitle}>{this.state.userId}</Text>
                        <Button
                            onPress={() => { Clipboard.setString(this.state.userId) }}
                            title="复制"
                        />
                    </View>
                </Modal>

                <Modal
                    animationInTiming={500}
                    animationOutTiming={1000}
                    isVisible={this.state.visibleModal === 'showQR'}
                    onBackdropPress={() => this.setState({ visibleModal: null })}
                >
                    <View style={styles.content} >
                        <QRCode
                            value={this.state.userId}
                            size={200}
                            color='black'
                            backgroundColor='white' />
                    </View>
                </Modal>
            </View>
        );
    }



}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    content: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    scrollableModal: {
        height: 300,
    },
    scrollableModalContent1: {
        height: 200,
        backgroundColor: '#87BBE0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollableModalText1: {
        fontSize: 20,
        color: 'white',
    },
    scrollableModalContent2: {
        height: 200,
        backgroundColor: '#A9DCD3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollableModalText2: {
        fontSize: 20,
        color: 'white',
    },
    customBackdrop: {
        flex: 1,
        backgroundColor: '#87BBE0',
        alignItems: 'center',
    },
    customBackdropText: {
        marginTop: 10,
        fontSize: 17,
    },
});
