#!/bin/bash

yarn solcjs --abi --include-path node_modules/ --base-path . -o src/abis node_modules/@leomarlo/voting-registry-contracts/src/examples/playground/Playground.sol