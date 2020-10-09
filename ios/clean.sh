#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Description:

rm -rf ios/build
(cd ios; xcodebuild clean)
