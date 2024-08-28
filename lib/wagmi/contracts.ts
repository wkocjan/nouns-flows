export const GRANTS_CONTRACT =
  "0x12e0c1bfddcbed42a4d4bc27e946ff3ead9b3dd5" as const

export const grantsAbi = [
  { stateMutability: "payable", type: "constructor", inputs: [] },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "PERCENTAGE_SCALE",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "recipient", internalType: "address", type: "address" }],
    name: "addApprovedRecipient",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "voters", internalType: "address[]", type: "address[]" },
      {
        name: "recipientsList",
        internalType: "address[][]",
        type: "address[][]",
      },
      {
        name: "percentAllocationsList",
        internalType: "uint32[][]",
        type: "uint32[][]",
      },
    ],
    name: "adminSetVotesAllocations",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "approvedRecipients",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "member", internalType: "address", type: "address" }],
    name: "claimAllFromPool",
    outputs: [],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [],
    name: "contractVersion",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "createAndAddSubGrantPool",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", internalType: "bytes1", type: "bytes1" },
      { name: "name", internalType: "string", type: "string" },
      { name: "version", internalType: "string", type: "string" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "verifyingContract", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "extensions", internalType: "uint256[]", type: "uint256[]" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "getAccountVotingPower",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "voter", internalType: "address", type: "address" }],
    name: "getAllVotes",
    outputs: [
      {
        name: "votesArray",
        internalType: "struct RevolutionGrantsStorageV1.VoteAllocation[]",
        type: "tuple[]",
        components: [
          { name: "recipient", internalType: "address", type: "address" },
          { name: "bps", internalType: "uint32", type: "uint32" },
          { name: "memberUnits", internalType: "uint128", type: "uint128" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "member", internalType: "address", type: "address" }],
    name: "getClaimableBalanceNow",
    outputs: [
      { name: "claimableBalance", internalType: "int256", type: "int256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "memberAddr", internalType: "address", type: "address" }],
    name: "getMemberFlowRate",
    outputs: [{ name: "flowRate", internalType: "int96", type: "int96" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "member", internalType: "address", type: "address" }],
    name: "getPoolMemberUnits",
    outputs: [{ name: "units", internalType: "uint128", type: "uint128" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "memberAddr", internalType: "address", type: "address" }],
    name: "getTotalAmountReceivedByMember",
    outputs: [
      { name: "totalAmountReceived", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getTotalFlowRate",
    outputs: [{ name: "totalFlowRate", internalType: "int96", type: "int96" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getTotalUnits",
    outputs: [{ name: "totalUnits", internalType: "uint128", type: "uint128" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "getVotesForAccount",
    outputs: [
      {
        name: "allocations",
        internalType: "struct RevolutionGrantsStorageV1.VoteAllocation[]",
        type: "tuple[]",
        components: [
          { name: "recipient", internalType: "address", type: "address" },
          { name: "bps", internalType: "uint32", type: "uint32" },
          { name: "memberUnits", internalType: "uint128", type: "uint128" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getVotingPowerForBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "grantsImpl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_votingPower", internalType: "address", type: "address" },
      { name: "_superToken", internalType: "address", type: "address" },
      { name: "_initialOwner", internalType: "address", type: "address" },
      { name: "_grantsImpl", internalType: "address", type: "address" },
      {
        name: "_grantsParams",
        internalType: "struct IRevolutionGrants.GrantsParams",
        type: "tuple",
        components: [
          { name: "tokenVoteWeight", internalType: "uint256", type: "uint256" },
          {
            name: "pointsVoteWeight",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "quorumVotesBPS", internalType: "uint256", type: "uint256" },
          {
            name: "minVotingPowerToVote",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "minVotingPowerToCreate",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "isGrantPool",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "minVotingPowerToCreate",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "minVotingPowerToVote",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "pendingOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "pointsVoteWeight",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "pool",
    outputs: [
      { name: "", internalType: "contract ISuperfluidPool", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "poolConfig",
    outputs: [
      {
        name: "transferabilityForUnitsOwner",
        internalType: "bool",
        type: "bool",
      },
      {
        name: "distributionFromAnyAddress",
        internalType: "bool",
        type: "bool",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "quorumVotesBPS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_flowRate", internalType: "int96", type: "int96" }],
    name: "setFlowRate",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_grantsImpl", internalType: "address", type: "address" }],
    name: "setGrantsImpl",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_minVotingPowerToCreate",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "setMinVotingPowerToCreate",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "_minVotingPowerToVote",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "setMinVotingPowerToVote",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "_quorumVotesBPS", internalType: "uint256", type: "uint256" },
    ],
    name: "setQuorumVotesBPS",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_superToken", internalType: "address", type: "address" }],
    name: "setSuperTokenAndCreatePool",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "recipients", internalType: "address[]", type: "address[]" },
      {
        name: "percentAllocations",
        internalType: "uint32[]",
        type: "uint32[]",
      },
    ],
    name: "setVotesAllocations",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "snapshotBlock",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "superToken",
    outputs: [
      { name: "", internalType: "contract ISuperToken", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "tokenVoteWeight",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_newImpl", internalType: "address", type: "address" }],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "_newImpl", internalType: "address", type: "address" },
      { name: "_data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "voterToRecipientMemberUnits",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "votes",
    outputs: [
      { name: "recipient", internalType: "address", type: "address" },
      { name: "bps", internalType: "uint32", type: "uint32" },
      { name: "memberUnits", internalType: "uint128", type: "uint128" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "votingPower",
    outputs: [
      {
        name: "",
        internalType: "contract IRevolutionVotingPower",
        type: "address",
      },
    ],
  },
  { type: "event", anonymous: false, inputs: [], name: "EIP712DomainChanged" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldFlowRate",
        internalType: "int96",
        type: "int96",
        indexed: false,
      },
      {
        name: "newFlowRate",
        internalType: "int96",
        type: "int96",
        indexed: false,
      },
    ],
    name: "FlowRateUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "parent",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "revolutionGrants",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GrantPoolCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "recipient",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approvedBy",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GrantRecipientApproved",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "grantsImpl",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "GrantsImplementationSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldMinVotingPowerToCreate",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newMinVotingPowerToCreate",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MinVotingPowerToCreateSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldMinVotingPowerToVote",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newMinVotingPowerToVote",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MinVotingPowerToVoteSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferStarted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldQuorumVotesBPS",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newQuorumVotesBPS",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "QuorumVotesBPSSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "impl",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "recipient",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "voter",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "memberUnits",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "bps", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "VoteCast",
  },
  { type: "error", inputs: [], name: "ADDRESS_ZERO" },
  { type: "error", inputs: [], name: "ARRAY_LENGTH_MISMATCH" },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  { type: "error", inputs: [], name: "DOES_NOT_MEET_QUORUM" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "INVALID_BPS_SUM" },
  { type: "error", inputs: [], name: "INVALID_ERC20_VOTING_WEIGHT" },
  { type: "error", inputs: [], name: "INVALID_ERC721_VOTING_WEIGHT" },
  { type: "error", inputs: [], name: "INVALID_QUORUM_BPS" },
  { type: "error", inputs: [], name: "INVALID_SIGNATURE" },
  {
    type: "error",
    inputs: [{ name: "impl", internalType: "address", type: "address" }],
    name: "INVALID_UPGRADE",
  },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NOT_APPROVED_RECIPIENT" },
  { type: "error", inputs: [], name: "NOT_MANAGER" },
  { type: "error", inputs: [], name: "NotInitializing" },
  { type: "error", inputs: [], name: "ONLY_CALL" },
  { type: "error", inputs: [], name: "ONLY_DELEGATECALL" },
  { type: "error", inputs: [], name: "ONLY_PROXY" },
  { type: "error", inputs: [], name: "ONLY_UUPS" },
  { type: "error", inputs: [], name: "OVERFLOW" },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  { type: "error", inputs: [], name: "ReentrancyGuardReentrantCall" },
  { type: "error", inputs: [], name: "SENDER_NOT_MANAGER" },
  { type: "error", inputs: [], name: "SIGNATURE_EXPIRED" },
  { type: "error", inputs: [], name: "UNITS_UPDATE_FAILED" },
  { type: "error", inputs: [], name: "UNSUPPORTED_UUID" },
  { type: "error", inputs: [], name: "WEIGHT_TOO_LOW" },
] as const