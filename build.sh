#!/bin/bash

rm -rf dist
mkdir dist

cp -r node_modules *.js plugin.json logo.png dist
