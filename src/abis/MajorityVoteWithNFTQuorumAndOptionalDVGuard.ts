export default [
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
    "name": "AlreadyVoted",
    "type": "error"
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
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "DeadlineHasNotPassed",
    "type": "error"
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
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "DeadlineHasPassed",
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
    "name": "ExpectedReturnError",
    "type": "error"
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
    "inputs": [],
    "name": "InvalidCalldata",
    "type": "error"
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
    "name": "StatusError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "identifier",
        "type": "uint256"
      }
    ],
    "name": "Implemented",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "identifier",
        "type": "uint256"
      }
    ],
    "name": "NotImplemented",
    "type": "event"
  },
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
        "internalType": "bytes",
        "name": "votingParams",
        "type": "bytes"
      }
    ],
    "name": "decodeParameters",
    "outputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quorumInTokens",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "expectReturnValue",
        "type": "bool"
      },
      {
        "internalType": "enum HandleDoubleVotingGuard.VotingGuard",
        "name": "guardOnSenderVotingDataOrNone",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quorumInTokens",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "expectReturnValue",
        "type": "bool"
      },
      {
        "internalType": "enum HandleDoubleVotingGuard.VotingGuard",
        "name": "guardOnSenderVotingDataOrNone",
        "type": "uint8"
      }
    ],
    "name": "encodeParameters",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "votingParams",
        "type": "bytes"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentIndex",
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
    "name": "getToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
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
        "internalType": "bytes",
        "name": "callback",
        "type": "bytes"
      }
    ],
    "name": "implement",
    "outputs": [
      {
        "internalType": "enum IImplementResult.Response",
        "name": "",
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
    "stateMutability": "pure",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]