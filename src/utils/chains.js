"use strict";
exports.__esModule = true;
exports.reverseResolveChainId = exports.resolveChainId = exports.supportedChainIds = void 0;
exports.supportedChainIds = [
    1,
    5,
    137,
    1337,
    80001,
    1337802,
    11155111 // Sepolia
];
exports.resolveChainId = {
    mainnet: 1,
    goerli: 5,
    polygon: 137,
    localhost: 1337,
    mumbai: 80001,
    kiln: 1337802,
    sepolia: 11155111
};
exports.reverseResolveChainId = {
    1: "mainnet",
    5: "goerli",
    137: "polygon",
    1337: "localhost",
    80001: "mumbai",
    1337802: "kiln",
    11155111: "sepolia"
};
