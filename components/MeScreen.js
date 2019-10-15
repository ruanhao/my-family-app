import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Button,
    Image,
    Clipboard,
    Text,
} from 'react-native';
import { getFileName, downloadAndGetImageUrl } from '../utils/Utils';
import { info, error } from '../utils/LogUtils';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-community/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { Avatar } from 'react-native-elements';
import { FETCH_USER_URL, UPLOAD_USER_AVATAR_URL, getAvatarImageUri } from '../utils/Constants';
import PhotoUpload from 'react-native-photo-upload'
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

// const DEFAULT_AVATAR_URI = 'https://www.nationalgeographic.com/content/dam/animals/thumbs/rights-exempt/mammals/d/domestic-dog_thumb.jpg';
// const DEFAULT_AVATAR = require('../assets/default_avatar.jpg');
const DEFAULT_AVATAR = require('../assets/default-avatar.png');

export default class MeScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
        };
    };

    constructor() {
        super();
    }

    state = {
        userId: null,
        username: "",
        nickname: "",
        avatarImageUri: "",
        visibleModalId: null,
    };

    async componentDidMount() {
        const userId = await AsyncStorage.getItem('userId');
        this.setState({ username: userId }); // render userId at first when response is not return yet
        try {
            let response = await fetch(FETCH_USER_URL + "/" + userId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let responseJson = await response.json();
            let avatarImageUri = '';
            if (responseJson.avatarImageId) {
                let imageUri = getAvatarImageUri(responseJson.avatarImageId);
                let { uri } = await downloadAndGetImageUrl(responseJson.avatarImageId, imageUri);
                avatarImageUri = uri;
                // console.log("image uri: ", avatarImageUri);
            }
            this.setState({
                userId: responseJson.id,
                username: responseJson.username,
                nickname: responseJson.nickname,
                avatarImageUri,
            });
        } catch {
            error("Error when fetch user info");
        }
    }

    showUserId = async () => {
        const userId = await AsyncStorage.getItem('userId');
        this.setState({ visibleModal: 'showUserId', userId: userId });
    }

    showQR = async () => {
        const userId = await AsyncStorage.getItem('userId');
        this.setState({ visibleModal: 'showQR', userId: userId });
    }

    _uploadAvatar = async (response) => {
        console.log("avatar response: ", response);
        const { uri, type, name } = response;
        if (!uri) {
            return;
        }
        const userId = await AsyncStorage.getItem('userId');
        const data = new FormData();
        data.append('image', {
            uri: uri,
            type: type,
            name: name,
        });
        fetch(UPLOAD_USER_AVATAR_URL, {
            method: 'POST',
            headers: {
                'USER-ID': userId,
            },
            body: data,
        }).then(res => {

        }).catch(e => {
            error("Error when uploading avatar: " + e.message);
        });

    }

    render() {
        let imageSrc = { cache: 'force-cache' };
        if (this.state.avatarImageUri) {
            // imageSrc.uri = getAvatarImageUri(this.state.avatarImageId);
            imageSrc.uri = this.state.avatarImageUri;
        } else {
            imageSrc = DEFAULT_AVATAR;
        }
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <View style={{ flex: 3 }}>
                        <PhotoUpload
                            onResizedImageUri={async (response) => this._uploadAvatar(response)}
                            quality={10}
                        >
                            <Image
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 75
                                }}
                                resizeMode='cover'
                                source={imageSrc}
                            />
                        </PhotoUpload>
                    </View>
                    <View style={{ flex: 7, marginLeft: 10 }}>
                        <Text style={styles.titleTextH1}>{this.state.nickname}</Text>
                        <Text style={styles.titleTextH2}>足记号: {this.state.username}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={this.showQR}
                    >
                        <FontAwesome
                            name="qrcode"
                            size={30}
                        />
                    </TouchableOpacity>

                </View>

                <TouchableOpacity
                    onPress={() => { this.props.navigation.navigate('SettingsScreen') }}
                >
                    <View style={styles.sectionContainer} >

                        <View>
                            <Feather
                                name="settings"
                                size={25}
                                color="dodgerblue"
                            />
                        </View>
                        <View style={styles.sectionMiddle}>
                            <Text style={styles.sectionText}>设置</Text>
                        </View>
                        <View>
                            <Ionicons
                                name="ios-arrow-forward"
                                size={25}
                                color="gray"
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { this.props.navigation.navigate('InfoScreen') }}
                >
                    <View style={styles.sectionContainer} >
                        <View>
                            <Feather
                                name="info"
                                size={25}
                                color="lightcoral"
                            />
                        </View>
                        <View style={styles.sectionMiddle}>
                            <Text style={styles.sectionText}>调试信息</Text>
                        </View>
                        <View>
                            <Ionicons
                                name="ios-arrow-forward"
                                size={25}
                                color="gray"
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { this.props.navigation.navigate('QRScannerScreen') }}
                >
                    <View style={styles.sectionContainer} >
                        <View>
                            <Ionicons
                                name="md-qr-scanner"
                                size={25}
                                color="chocolate"
                            />
                        </View>
                        <View style={styles.sectionMiddle}>
                            <Text style={styles.sectionText}>扫码加好友</Text>
                        </View>
                        <View>
                            <Ionicons
                                name="ios-arrow-forward"
                                size={25}
                                color="gray"
                            />
                        </View>
                    </View>
                </TouchableOpacity>

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
            </View >
        );
    }



}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'whitesmoke',
    },
    title: {
        backgroundColor: "white",
        padding: 15,
        flexDirection: 'row',
        height: 120,
    },
    titleTextH1: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    titleTextH2: {
        fontSize: 15,
        color: "gray",
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
    sectionContainer: {
        padding: 10,
        paddingHorizontal: 20,
        marginTop: 10,
        flexDirection: 'row',
        backgroundColor: 'white',
        // justifyContent: 'flex-start',
        alignItems: 'center',
    },
    sectionLeft: {
        flex: 2,
    },
    sectionRight: {
        flex: 2,
    },
    sectionMiddle: {
        flex: 6,
    },
    sectionText: {
        fontSize: 18,
        // fontWeight: 'bold',
        marginLeft: 20,
    }
});
