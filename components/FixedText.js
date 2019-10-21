import React, { Component } from 'react';
import { Text } from 'react-native';

export default class FixedText extends Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <Text
                {...this.props}
                allowFontScaling={false}
            />
        );
    }
}