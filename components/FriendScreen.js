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

export default class FriendScreen extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => ({
        headerStyle: {
            borderBottomWidth: 0,
        },
        headerRight: (
            <Button
                onPress={() => {

                }}
                title="删除"
                color="red"
            />
        ),
    });

    state = {
        userId: "",
        nickname: "",
        avatarImageId: "",
        username: "",
    }

    componentDidMount() {
        const { navigation } = this.props;
        const user = navigation.getParam('user');
        const { id, nickname, avatarImageId, username } = user;
        this.setState({ userId: id, nickname, avatarImageId, username });
    }

    render() {
        const avatarSource = { cache: 'force-cache' };
        if (this.state.avatarImageId) {
            avatarSource.uri = getAvatarImageUri(this.state.avatarImageId);
        }
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Avatar
                        source={avatarSource}
                        size="large"
                        onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                        containerStyle={styles.titleAvatar}
                        icon={{ name: 'user', type: 'font-awesome' }}
                    />
                    <View>
                        <Text style={styles.titleTextH1}>{this.state.nickname}</Text>
                        <Text style={styles.titleTextH2}>足记号: {this.state.username}</Text>

                    </View>
                </View>
            </View>
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
    },
    titleAvatar: {
        marginRight: 10
    },
    titleTextH1: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    titleTextH2: {
        fontSize: 15,
        color: "gray",
    }
});
