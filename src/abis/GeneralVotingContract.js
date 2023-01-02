"use strict";
exports.__esModule = true;
exports["default"] = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "caller",
                "type": "address"
            }
        ],
        "name": "VotingInstanceStarted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "result",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "resultData",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "votingParams",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "callback",
                "type": "bytes"
            }
        ],
        "name": "start",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "votingData",
                "type": "bytes"
            }
        ],
        "name": "vote",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "status",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getCallbackData",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "callback",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getCallbackHash",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "callbackHash",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getDeadline",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getQuorum",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "quorum",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "inUnitsOf",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getToken",
        "outputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "voter",
                "type": "address"
            }
        ],
        "name": "hasAlreadyVoted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "alreadyVoted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "callback",
                "type": "bytes"
            }
        ],
        "name": "implement",
        "outputs": [
            {
                "internalType": "enum IImplementResult.Response",
                "name": "response",
                "type": "uint8"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "status",
                "type": "uint256"
            }
        ],
        "name": "ImplementingNotPermitted",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "implementingPermitted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "permitted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getStatus",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "status",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getDoubleVotingGuard",
        "outputs": [
            {
                "internalType": "enum HandleDoubleVotingGuard.VotingGuard",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "getTarget",
        "outputs": [
            {
                "internalType": "address",
                "name": "target",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "identifier",
                "type": "uint256"
            }
        ],
        "name": "votingPermitted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "permitted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
