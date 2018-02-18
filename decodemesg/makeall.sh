#!/bin/bash
export BUILD_MODE=debug
export CXXFLAGS='-I/usr/local/include -O2 -Wall'
make
