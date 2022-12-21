export default [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "votingContractRegistry",
        "type": "address"
      },
      {
        "internalType": "bytes5[]",
        "name": "flagAndSelectors",
        "type": "bytes5[]"
      },
      {
        "internalType": "address[]",
        "name": "votingContracts",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "minDurations",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "minQuorums",
        "type": "uint256[]"
      },
      {
        "internalType": "bool[]",
        "name": "badgeWeightedVote",
        "type": "bool[]"
      },
      {
        "internalType": "bytes32",
        "name": "hashedBadgeBytecode",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "mainBadge",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfBadges",
        "type": "uint256"
      }
    ],
    "name": "BadgeDoesntExist",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "imposter",
        "type": "address"
      }
    ],
    "name": "IsNotImplementer",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      }
    ],
    "name": "IsNotVotableFunction",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementer",
        "type": "address"
      }
    ],
    "name": "OnlyVoteImplementer",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "votingContract",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "successflag",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "response",
        "type": "bytes"
      }
    ],
    "name": "Balaa",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "response",
        "type": "bytes"
      }
    ],
    "name": "WhatsNow",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "VOTING_REGISTRY",
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
        "internalType": "address",
        "name": "votingContract",
        "type": "address"
      }
    ],
    "name": "addSimpleVotingContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "analytics",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "numberOfInstances",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfImplementations",
        "type": "uint256"
      },
      {
        "internalType": "uint24",
        "name": "numberOfSimpleVotingContracts",
        "type": "uint24"
      }
    ],
    "stateMutability": "view",
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
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approveERC20Token",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "enum ApprovalTypes",
        "name": "approvalType",
        "type": "uint8"
      }
    ],
    "name": "approveNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "badges",
    "outputs": [
      {
        "internalType": "contract IPlaygroundVotingBadge",
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
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      },
      {
        "internalType": "address",
        "name": "votingContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "minter",
        "type": "address"
      }
    ],
    "name": "calculateId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      },
      {
        "internalType": "address",
        "name": "newVotingContract",
        "type": "address"
      }
    ],
    "name": "changeAssignedContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "by",
        "type": "uint256"
      }
    ],
    "name": "changeCounter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      },
      {
        "internalType": "uint256",
        "name": "minDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minQuorum",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "changeMetaParameters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum Operation",
        "name": "newOperation",
        "type": "uint8"
      }
    ],
    "name": "changeOperation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "counter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "counter",
        "type": "uint256"
      },
      {
        "internalType": "enum Operation",
        "name": "operation",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "bytecode",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "badger",
        "type": "address"
      }
    ],
    "name": "deployNewBadge",
    "outputs": [
      {
        "internalType": "address",
        "name": "deployedContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "bytecode",
        "type": "bytes"
      }
    ],
    "name": "deployNewContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "deployedContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "deployedContracts",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "donationsBy",
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
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "name": "fixedVotingContract",
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
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      }
    ],
    "name": "getAssignedContract",
    "outputs": [
      {
        "internalType": "address",
        "name": "_assignedContract",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "office",
        "type": "string"
      }
    ],
    "name": "getIncumbentFromOffice",
    "outputs": [
      {
        "internalType": "address",
        "name": "incumbent",
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
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "instances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "identifier",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "votingContract",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minXpToStartAnything",
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
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "name": "minXpToStartThisFunction",
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
        "internalType": "string",
        "name": "office",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "newIncumbent",
        "type": "address"
      }
    ],
    "name": "newIncumbent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nftAndBadgesInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "mainBadge",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "acceptingNFTs",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "offices",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "view",
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
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendERC20Token",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "sendNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "accept",
        "type": "bool"
      }
    ],
    "name": "setAcceptingNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newThreshold",
        "type": "uint256"
      }
    ],
    "name": "setEnableTradingThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newMainBadge",
        "type": "uint256"
      }
    ],
    "name": "setMainBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newXP",
        "type": "uint256"
      }
    ],
    "name": "setMinXpToStartAnything",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      },
      {
        "internalType": "uint256",
        "name": "newXP",
        "type": "uint256"
      }
    ],
    "name": "setMinXpToStartThisFunction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "enable",
        "type": "bool"
      }
    ],
    "name": "setTradingEnabledGlobally",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint24",
        "name": "",
        "type": "uint24"
      }
    ],
    "name": "simpleVotingContract",
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
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "name": "votingMetaParams",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "minDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minQuorum",
        "type": "uint256"
      },
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
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "wildCard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]