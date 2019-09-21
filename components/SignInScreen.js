import React from 'react';
import { CheckBox } from 'react-native-elements'
import {
    Alert,
    View,
    Text,
    Button,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { REGISTER_USER_URL } from '../utils/Constants';
import { error } from '../utils/LogUtils';

const msg = {
    heading: "👣",
}

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        username: '',
        nickname: '',
        password: '',
        passwordAgain: '',
        checked: false,
    };

    onChangeText = (key, value) => {
        this.setState({ [key]: value });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.heading}>{msg.heading}</Text>
                <TextInput
                    keyboardType='ascii-capable'
                    placeholder='用户名'
                    onChangeText={val => this.onChangeText('username', val)}
                    style={styles.input}
                    value={this.state.username}
                />

                {this.state.checked &&
                    <TextInput
                        placeholder='昵称'
                        onChangeText={val => this.onChangeText('nickname', val)}
                        style={styles.input}
                        value={this.state.nickname}
                    />}

                <TextInput
                    secureTextEntry={true}
                    placeholder='密码'
                    onChangeText={val => this.onChangeText('password', val)}
                    style={styles.input}
                    value={this.state.password}
                />

                {this.state.checked && <TextInput
                    secureTextEntry={true}
                    placeholder='请再次输入密码'
                    onChangeText={val => this.onChangeText('passwordAgain', val)}
                    style={styles.input}
                    value={this.state.passwordAgain}
                />}

                {this.state.checked ||
                    <TouchableOpacity onPress={this._signInAsync}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>登陆</Text>
                        </View>
                    </TouchableOpacity>}

                {this.state.checked &&
                    <TouchableOpacity onPress={this._registerAsync}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>注册</Text>
                        </View>
                    </TouchableOpacity>
                }

                <CheckBox
                    right
                    containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, alignSelf: 'flex-end' }}
                    title='交个朋友'
                    checked={this.state.checked}
                    onPress={() => this.setState({ checked: !this.state.checked })}
                />

            </View>
        );
    }

    _registerAsync = async () => {
        if (this.state.username === '') {
            Alert.alert("请输入用户名");
            return;
        }
        if (!this.state.username.match(/^[0-9a-zA-Z]{1,64}$/)) {
            Alert.alert("用户名只限英文和数字");
            return;
        }
        if (this.state.password === '') {
            Alert.alert("请输入密码");
            return;
        }
        if (this.state.password != this.state.passwordAgain) {
            Alert.alert("两次输入的密码不相同")
            return;
        }
        try {
            let response = await fetch(REGISTER_USER_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.state.username,
                    nickname: this.state.nickname,
                    password: this.state.password,
                }),
            });
            let responseJson = await response.json();
            const userId = responseJson.id;
            if (typeof userId === 'undefined') {
                const errorMsg = responseJson.message;
                if (errorMsg.includes('duplicate key error')) {
                    Alert.alert("用户名已存在");
                    return;
                }
            } else { // success
                await AsyncStorage.setItem('userId', userId);
                this.props.navigation.navigate('App');
            }
        } catch (e) {
            error(e.message);
        }
    }

    _signInAsync = async () => {
        if (this.state.username === '') {
            Alert.alert("请输入用户名");
            return;
        }
        if (!this.state.username.match(/^[0-9a-zA-Z]{1,64}$/)) {
            Alert.alert("用户名只限英文和数字");
            return;
        }
        if (this.state.password === '') {
            Alert.alert("请输入密码");
            return;
        }

        // await AsyncStorage.setItem('userId', 'abc');
        this.props.navigation.navigate('App');
    };
}

/* const styles = StyleSheet.create({
 *     container: {
 *         flex: 1,
 *         alignItems: 'center',
 *         justifyContent: 'center',
 *     },
 * });*/

const styles = StyleSheet.create({
    button: {
        height: 50,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 18
    },
    heading: {
        color: 'white',
        fontSize: 40,
        marginBottom: 10,
        alignSelf: 'center'
    },
    container: {
        backgroundColor: 'lightblue',
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        margin: 10,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        height: 50
    }
})