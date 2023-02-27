import { ethers } from "ethers"
import { supportedChainIds, reverseResolveChainId } from "../utils/chains"
import deploymentInfo from "../deployment/deploymentInfo.json"
import { hexValue } from "ethers/lib/utils"
import axios from 'axios'
import votingContractABI from '../abis/GeneralVotingContract'
import playgroundABI from '../abis/VotingPlayground'
import votingRegistryABI from '../abis/VotingRegistry'
import { RegisteredContractsEventArgs } from "../types/components"


const PROTOCOL = "https://"
const BASE_URL = "raw.githubusercontent.com/leomarlo/voting-registry-contracts"
const BRANCH = "development"
const URL_PLAYGROUND_ABI = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/examples/playground/Playground.sol/VotingPlayground.json"
const URL_VOTING_REGISTRY_ABI = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/registration/registry/VotingRegistry.sol/VotingPlayground.json"
const URL_DEPLOYMENT_INFO = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "scripts/verification/deploymentArgs/deploymentInfo.json"
const URL_VOTING_INTERFACES = {
  URL_IVOTINGCONTRACT: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/votingContractStandard/IVotingContract.sol/IVotingContract.json",
  URL_IGETCALLBACKDATA: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetCallbackData.sol/IGetCallbackData.json",
  URL_IGETCALLBACKHASH: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetCallbackHash.sol/IGetCallbackHash.json",
  URL_IGETDEADLINE: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetDeadline.sol/IGetDeadline.json",
  URL_IGETQUROUM: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetQuorum.sol/IGetQuorum.json",
  URL_IGETTOKEN: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetToken.sol/IGetToken.json",
  URL_IHASALREADYVOTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IHasAlreadyVoted.sol/IHasAlreadyVoted.json",
  URL_IIMPLEMENTRESULT: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IImplementResult.sol/IImplementResult.json",
  URL_IIMPLEMENTINGPERMITTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IImplementingPermitted.sol/IImplementingPermitted.json",
  URL_ISTATUSGETTER: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IStatusGetter.sol/IStatusGetter.json",
  URL_IGETDOUBLEVOTINGGUARD: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetDoubleVotingGuard.sol/IGetDoubleVotingGuard.json",
  URL_ITARGETGETTER: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/ITargetGetter.sol/ITargetGetter.json",
  URL_IVOTINGPERMITTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IVotingPermitted.sol/IVotingPermitted.json"
}

const TOKEN_MINIMAL_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address _owner) public view returns (uint256 balance)"
]
const TOKEN_WITH_ERC165_INTERFACE = TOKEN_MINIMAL_ABI.concat([
  "function supportsInterface(bytes4) external view returns (bool)"
])

const BADGE_TOKEN_INTERFACE = TOKEN_WITH_ERC165_INTERFACE.concat([
  "function mint(address to, uint256 index, bytes4 selector, address votingContract) external",
  "function exists(uint256 tokenId) external view returns(bool)",
  "function balanceOfSignature(address owner, bytes4 selector) view external returns(uint256)",
  "function changeEnableTradingThreshold(uint256 newThreshold) external",
  "function changeTradingEnabledGlobally(bool enable) external",
  "function approveContract(address newContract, bool approval) external returns(bool)"
])


const ERC165_ID = "0x01ffc9a7"
const ERC721_ID = "0x80ac58cd"
const ERC1155_ID = "0xd9b67a26"

const getABI = async (url: string) => {
  let res = await axios.get(url)
  return res.data.abi
}

const getDeploymentInfo = async () => {
  let res = await axios.get(URL_DEPLOYMENT_INFO)
  return res.data
}

const getPlaygroundABI = async () => {

  // console.log('inside getPlaygroundABI')
  // return []
  return await getABI(URL_PLAYGROUND_ABI)
}

const getEthersInterface = async (url: string) => {
  let abi: Array<Object> = await getABI(url)
  return new ethers.utils.Interface(abi)
}

const getGeneralVotingInterface = async (fromHttpRequest: boolean) => {
  if (fromHttpRequest) {
    let res: Array<Object> = []
    let interfaceURLs = Object.values(URL_VOTING_INTERFACES)
    for (let i = 0; i < interfaceURLs.length; i++) {
      let interfaceURL = interfaceURLs[i]
      res = res.concat(await getABI(interfaceURL))
    }
    return res
  }
  return votingContractABI
}

const getVotingRegistryInterface = async (fromHttpRequest: boolean) => {
  if (fromHttpRequest) {
    let res: Array<Object> = []
    let interfaceURLs = Object.values(URL_VOTING_REGISTRY_ABI)
    for (let i = 0; i < interfaceURLs.length; i++) {
      let interfaceURL = interfaceURLs[i]
      res = res.concat(await getABI(interfaceURL))
    }
    return res
  }
  return votingRegistryABI
}

const getPlaygroundInterface = async (fromHttpRequest: boolean) => {
  if (fromHttpRequest) return await getEthersInterface(URL_PLAYGROUND_ABI)
  return playgroundABI
}



const getContract = async (chainId: number, contractName: string, abi: Array<Object>) => {
  let address = await getContractAddress(chainId, contractName)
  return new ethers.Contract(address, abi)
}

const getPlaygroundContract = async (chainId: number, fromHttpRequest?: boolean) => {
  console.log('inside getPlaygroundContract')
  return getContract(
    chainId,
    "VotingPlayground",
    fromHttpRequest ? await getPlaygroundInterface(fromHttpRequest) : await getPlaygroundABI()
  )
}

const getPlaygroundViewFunctionsFromInterface = async (fromHttpRequest: boolean) => {

  return Object.values((await getPlaygroundInterface(fromHttpRequest)))
    .filter(v => { return v.type == "function" })
    .filter(v => { return v.stateMutability == "view" })
}

const getPlaygroundMutableFunctionsFromInterface = async (fromHttpRequest: boolean) => {
  return Object.values((await getPlaygroundInterface(fromHttpRequest)))
    .filter(v => {
      let cond: boolean =
        v.type == "function" &&
        (v.stateMutability == "payable" || v.stateMutability == "nonpayable") &&
        !(v.name === undefined || v.name == "vote" || v.name == "start" || v.name == "implement")
      return cond
    })
  // .filter(v => { return  })
}

const getContractAddress = async (chainId: number, contractName: string) => {

  let flag = false
  let networkName = reverseResolveChainId[chainId as number] as string
  let info = flag ? await getDeploymentInfo() : deploymentInfo
  let deploymentInfoNetwork = info[networkName as keyof typeof info]
  return deploymentInfoNetwork[contractName].address
}

const getContractAddressesForAllChains = () => {
  let contractNames = {
    "Registry": "VotingRegistry",
    "Playground Voting Badge": "PlaygroundVotingBadge",
    "Registrar": "ControllableRegistrar",
    "Resolver": "ResolverWithControl",
    "Majority Voting Contract (not weighted)": "PlainMajorityVoteWithQuorum",
    "Majority Voting Contract (NFT weighted)": "MajorityVoteWithNFTQuorumAndOptionalDVGuard",
    "Snapshot": "SimpleSnapshotWithoutToken",
    "Playground": "VotingPlayground",
  }
  let addresses: { [chain: string]: { [contract: string]: string } } = {}
  let addressesForThisChain: { [contract: string]: string } = {}
  for (let chainId of supportedChainIds) {
    let name = reverseResolveChainId[chainId]
    let deploymentInfoChain = deploymentInfo[name as keyof typeof deploymentInfo]

    let displayableContractNames = Object.keys(contractNames)
    for (const contract of displayableContractNames) {
      //   console.log('contract name', contract)
      // }
      try {
        let thisContractAddress = deploymentInfoChain[contractNames[contract as keyof typeof contractNames] as keyof typeof deploymentInfoChain].address
        addressesForThisChain[contract] = thisContractAddress
      } catch (err) {
        console.log(err)
      }

      // if (deploymentInfoChain[internalContractName as keyof typeof deploymentInfoChain]) {
      //   addressesForThisChain[contract] = deploymentInfoChain[contractNames[contract as keyof typeof contractNames] as keyof typeof deploymentInfoChain].address
      // }
    }
    // addresses[name] = { "Registry": "abcd" }
    addresses[name] = addressesForThisChain
    addressesForThisChain = {}
  }
  return addresses
}

const getPlaygroundAddress = async (chainId: number) => {
  return await getContractAddress(chainId, "VotingPlayground")
}


async function getRegisteredVotingContracts(registry: ethers.Contract): Promise<Array<RegisteredContractsEventArgs>> {
  let zero = ethers.constants.AddressZero
  let flt = registry.filters.Registered(null, null, null)
  const events = await registry.queryFilter(flt)
  return events.map((e) => {
    return {
      contractAddress: e.args ? e.args.contractAddress : zero,
      registrar: e.args ? e.args.registrar : zero,
      resolver: e.args ? e.args.resolver : zero
    }
  })
}

const getBlockexplorerBaseUrlFromChainId = (chainId: number, forApiCall: boolean) => {
  let baseurl = ""

  if (chainId === 137 || chainId === 80001) {
    let testnet: boolean = chainId != 137
    let testnetornot = (!testnet) ? "" : "-testnet"
    let apiOption = forApiCall ? "api" : ""
    let withDot = forApiCall || testnet ? "." : ""
    baseurl = `https://${apiOption}${testnetornot}${withDot}polygonscan.com`
  } else if (chainId == 42161 || chainId == 421613) {
    let testnet: boolean = chainId != 42161
    let testnetornot = (!testnet) ? "" : "-goerli"
    let apiOption = forApiCall ? "api" : ""
    let withDot = forApiCall || testnet ? "." : ""
    baseurl = `https://${apiOption}${testnetornot}${withDot}arbiscan.io`
  } else {
    let testnet: boolean = chainId != 1
    let testnetornot = (!testnet) ? "" : reverseResolveChainId[chainId]
    let apiOption = forApiCall ? "api-" : ""
    let withDot = forApiCall || testnet ? "." : ""
    baseurl = `https://${apiOption}${testnetornot}${withDot}etherscan.io`
  }
  return baseurl
}

async function getContractABIFromEtherscan(contractAddress: string, apiKey: string, chainId: number) {

  // 137: "polygon",
  // 80001: "mumbai",
  // TODO.... different API key for polygon/matic and ethereum + ethereum testnets!

  let baseurl = getBlockexplorerBaseUrlFromChainId(chainId, true)

  let url = baseurl + `/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`
  console.log('The api call is ', url)
  try {
    let res = await axios.get(url)
    let result = res.data.result
    console.log('inside the api request')
    try {
      console.log('returning parsed JSON works', JSON.parse(result))
      return JSON.parse(result)
    } catch (err) {
      return result
    }
  } catch (err) {
    console.log(err)
    return {}
  }

}


type queryViewFunction<T> = { result: T, message: string }

interface ErcInterfaceFlags {
  erc165: boolean,
  erc721: boolean,
  erc1155: boolean,
}

interface TokenInfo {
  name: string,
  symbol: string,
  address: string,
  balance: ethers.BigNumber,
  balanceBySelector: {
    start: ethers.BigNumber,
    vote: ethers.BigNumber,
    implement: ethers.BigNumber,
    other: ethers.BigNumber
  } | undefined,
  decimals: ethers.BigNumber | undefined,
  interfaces: ErcInterfaceFlags
}
type DoubleVotingGuard = "None" | "On Sender" | "On Voting Data"

interface VotingInstanceExternalInfo {
  votingContract: ethers.Contract,
  targetAddress: string | undefined,
  identifier: ethers.BigNumber,
  deadline: string | undefined,
  ttl: number | undefined,
  status: string | undefined,
  result: string,
  implementingPermitted: boolean | undefined
  token: TokenInfo | undefined,
  doubleVotingGuard: DoubleVotingGuard | undefined,
  quorum: { value: string, inUnitsOf: string } | undefined
}

interface VotingInstanceChainInfo {
  hash?: string
  successfulAttempt: boolean,
  successfulImplement: boolean,
  attempts: number
}

interface TargetInterface {
  id: string,
  name?: string,
  isFunction: boolean,
  calldata: string,
  decoded?: Array<{ name: string, value: string }>
}

interface InstanceInternalInfo {
  index: ethers.BigNumber,
  sender: string | undefined,
  target: TargetInterface
}

interface InstancePointer {
  identifier: ethers.BigNumber,
  votingContractAddress: string
}

interface InstanceInternalInfoAndPointer {
  internal: InstanceInternalInfo,
  pointer: InstancePointer
}

interface VotingInstanceInfo extends InstanceInternalInfoAndPointer {
  external: VotingInstanceExternalInfo,
  chainInfo: VotingInstanceChainInfo
}

async function getPlaygroundInstancesFromEvents(playgroundContract: ethers.Contract): Promise<Array<InstanceInternalInfo>> {
  let flt = playgroundContract.filters.VotingInstanceStarted(null, null, null)
  // console.log(eventsRes)
  const events = await playgroundContract.queryFilter(flt)
  return events.map((e) => {
    let calldata: string = e.args?.target
    let target: TargetInterface = {
      id: calldata.slice(0, Math.min(calldata.length, (2 + 2 * 4))),
      isFunction: calldata.length >= (2 + 2 * 4),
      calldata: calldata
    }
    if (target.isFunction) {
      target.name = playgroundContract.interface.getFunction(target.id).name
      let decodedObject = playgroundContract.interface.decodeFunctionData(target.name, calldata)
      let allKeys = Object.keys(decodedObject)
      let decoded: Array<{ name: string, value: string }> = allKeys.slice(Math.floor(allKeys.length / 2),).map((k: string) => {
        return {
          name: k,
          value: decodedObject[k as string]
        }
      })
      target.decoded = decoded
      // console.log('decoded RESULT:::', allKeys.slice(Math.floor(allKeys.length / 2),))
    }
    let instanceInternalInfo: InstanceInternalInfo = { index: e.args?.index, sender: e.args?.sender, target: target }
    return instanceInternalInfo
  })
}

async function getResult(
  votingContract: ethers.Contract,
  identifier: ethers.BigNumber
): Promise<queryViewFunction<{ result: string }>> {
  let message: string = ""
  let result: string
  try { result = await votingContract.result(identifier) }
  catch (err) { result = ""; message = "No result has been found!\n" }
  return { result: { result: result }, message: message }
}

async function getDeadline(
  votingContract: ethers.Contract,
  identifier: ethers.BigNumber
): Promise<queryViewFunction<{ deadline: string | undefined, ttl: number | undefined }>> {
  let message: string = ""
  let deadline: string | undefined
  let ttl: number | undefined
  try {
    let deadlineInSeconds = (await votingContract.getDeadline(identifier)).toNumber()
    deadline = (new Date(deadlineInSeconds * 1000)).toLocaleString();
    let currentTimeInSeconds = Math.floor(Date.now() / 1000)
    ttl = Math.max(deadlineInSeconds - currentTimeInSeconds, 0)
  } catch (err) {
    message += 'No getDeadline method found!\n'
    deadline = undefined
    ttl = undefined
  }
  return { result: { deadline: deadline, ttl: ttl }, message: message }
}

async function getStatus(
  votingContract: ethers.Contract,
  identifier: ethers.BigNumber
): Promise<queryViewFunction<{ status: string }>> {
  let message: string = ""
  let status: string = "0"
  try {
    status = (await votingContract.getStatus(identifier)).toString()
  } catch (err) { message += 'No getStatus method found!\n' }

  return { result: { status: status }, message: message }
}


async function getTokenDecimals(
  token: ethers.Contract
): Promise<queryViewFunction<{ decimals: ethers.BigNumber | undefined }>> {
  let message: string = ""
  let decimals = ethers.BigNumber.from("0")
  try { decimals = (await token.decimals()) }
  catch (err) { message = 'No Decimals method found!\n' }
  return { result: { decimals: decimals }, message: message }
}

async function getTokenName(
  token: ethers.Contract
): Promise<queryViewFunction<{ name: string }>> {
  let message: string = ""
  let name: string = ""
  try { name = (await token.name()) }
  catch (err) { message = 'No token name found!\n' }
  return { result: { name: name }, message: message }
}

async function getTokenSymbol(
  token: ethers.Contract
): Promise<queryViewFunction<{ symbol: string }>> {
  let message: string = ""
  let symbol: string = ""
  try { symbol = (await token.symbol()) }
  catch (err) { message = 'No token symbol found!\n' }
  return { result: { symbol: symbol }, message: message }
}

async function getTokenBalance(
  token: ethers.Contract,
  address: string
): Promise<queryViewFunction<{ balance: ethers.BigNumber }>> {
  let message: string = ""
  let balance = ethers.BigNumber.from("0")
  try { balance = (await token.balanceOf(address)) }
  catch (err) { message = 'No token balance method found!\n' }
  return { result: { balance: balance }, message: message }
}

async function getTokenBalanceOfSelectorstoken(
  token: ethers.Contract,
  startSelector: string,
  voteSelector: string,
  implementSelector: string,
  address: string
): Promise<queryViewFunction<{
  start: ethers.BigNumber,
  vote: ethers.BigNumber,
  implement: ethers.BigNumber
} | undefined>> {
  let message: string = ""
  let result: {
    start: ethers.BigNumber,
    vote: ethers.BigNumber,
    implement: ethers.BigNumber
  } | undefined = undefined
  try {
    let balanceResults = await Promise.all([
      token.balanceOfSignature(address, startSelector),
      token.balanceOfSignature(address, voteSelector),
      token.balanceOfSignature(address, implementSelector)
    ])
    result = { start: balanceResults[0], vote: balanceResults[1], implement: balanceResults[2] }
  } catch (err) { message = 'No token balance for selectors method found!\n' }
  return { result: result, message: message }
}


async function getTokenSpecs(
  signerAddress: string,
  token: ethers.Contract,
  votingContract?: ethers.Contract
): Promise<queryViewFunction<{
  name: string,
  symbol: string,
  decimals: ethers.BigNumber | undefined,
  balance: ethers.BigNumber
  balanceBySelector?: {
    start: ethers.BigNumber,
    vote: ethers.BigNumber,
    implement: ethers.BigNumber,
    other: ethers.BigNumber,
  }
}>> {

  if (votingContract) {
    let tokenSpecs: Array<{ result: any, message: string }> = await Promise.all(
      [
        getTokenName(token),
        getTokenSymbol(token),
        getTokenDecimals(token),
        getTokenBalance(token, signerAddress),
        getTokenBalanceOfSelectorstoken(token, votingContract.interface.getSighash("start"), votingContract.interface.getSighash("vote"), votingContract.interface.getSighash("implement"), signerAddress),
      ]
    )
    return {
      result:
      {
        name: tokenSpecs[0].result.name,
        symbol: tokenSpecs[1].result.symbol,
        decimals: tokenSpecs[2].result.decimals,
        balance: tokenSpecs[3].result.balance,
        balanceBySelector: {
          ...tokenSpecs[4].result,
          other: 4
        },
      },
      message: tokenSpecs.map(r => r.message).join("")
    }
  } else {
    let tokenSpecs: Array<{ result: any, message: string }> = await Promise.all(
      [
        getTokenName(token),
        getTokenSymbol(token),
        getTokenDecimals(token),
        getTokenBalance(token, signerAddress),
      ]
    )
    return {
      result:
      {
        name: tokenSpecs[0].result.name,
        symbol: tokenSpecs[1].result.symbol,
        decimals: tokenSpecs[2].result.decimals,
        balance: tokenSpecs[3].result.balance,
      },
      message: tokenSpecs.map(r => r.message).join("")
    }
  }


}

async function getTokenERCInterfaces(
  token: ethers.Contract
): Promise<queryViewFunction<{ interfaces: ErcInterfaceFlags }>> {
  let message: string = ""
  let interfaces: ErcInterfaceFlags = { erc165: false, erc721: false, erc1155: false }
  try {
    let interfacesResolution = await Promise.all(
      [
        token.supportsInterface(ERC165_ID),
        token.supportsInterface(ERC721_ID),
        token.supportsInterface(ERC1155_ID)
      ]
    )
    interfaces = {
      erc165: interfacesResolution[0],
      erc721: interfacesResolution[1],
      erc1155: interfacesResolution[2]
    }
  } catch (err) { message = 'No supportsInterface method found!\n' }
  return { result: { interfaces: interfaces }, message: message }
}



async function getTokenInfo(
  signer: ethers.providers.JsonRpcSigner,
  signerAddress: string,
  votingContract: ethers.Contract,
  identifier: ethers.BigNumber
): Promise<queryViewFunction<{ token: TokenInfo | undefined }>> {
  let message: string = ""
  let token: TokenInfo | undefined = undefined

  try {
    let tokenAddress = await votingContract.getToken(identifier)
    let tokenInterface = new ethers.Contract(tokenAddress, BADGE_TOKEN_INTERFACE, signer)
    let result = await Promise.all(
      [
        getTokenSpecs(signerAddress, tokenInterface, votingContract),
        getTokenERCInterfaces(tokenInterface)
      ]
    )
    token = {
      address: tokenAddress,
      name: result[0].result.name,
      symbol: result[0].result.symbol,
      decimals: result[0].result.decimals,
      balance: result[0].result.balance,
      balanceBySelector: result[0].result.balanceBySelector,
      interfaces: result[1].result.interfaces
    }

    message += result.map(r => r.message).join("")
  } catch (err) { console.log(err); message = 'No getToken method found!\n' + JSON.stringify(err) + '\n' }
  return { result: { token: token }, message: message }
}



async function getVotingInstanceExternalInfo(
  signer: ethers.providers.JsonRpcSigner,
  votingContractAddress: string,
  votingContractABI: Array<Object>,
  identifier: ethers.BigNumber): Promise<VotingInstanceExternalInfo> {

  // console.log('identifier', identifier)

  let signerAddress = await signer.getAddress()

  let votingInstanceExternalInfo = {} as VotingInstanceExternalInfo
  let message = ''

  // instantiate contract 
  let votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer)

  // save contract instance into external info object
  votingInstanceExternalInfo.votingContract = votingContract

  // identifier
  votingInstanceExternalInfo.identifier = identifier

  /* Define all the promises that we try to resolve in parallel */
  let result: Array<{ result: any, message: string }> = await Promise.all(
    [
      getResult(votingContract, identifier),
      getDeadline(votingContract, identifier),
      getStatus(votingContract, identifier),
      getTokenInfo(signer, signerAddress, votingContract, identifier)
    ]
  )

  votingInstanceExternalInfo.result = result[0].result.result
  votingInstanceExternalInfo.deadline = result[1].result.deadline
  votingInstanceExternalInfo.ttl = result[1].result.ttl
  votingInstanceExternalInfo.status = result[2].result.status
  votingInstanceExternalInfo.token = result[3].result.token


  message = result.map(r => r.message).join("")


  // target 
  try {
    let targetAddress = (await votingContract.getTarget(identifier))
    votingInstanceExternalInfo.targetAddress = targetAddress
  } catch (err) { console.log('getTarget', err); message += 'No getTarget method found!\n' }

  // double voting
  try {
    let doubleVotingType = (await votingContract.getDoubleVotingGuard(identifier))
    votingInstanceExternalInfo.doubleVotingGuard = doubleVotingType == 0 ? "None" : (doubleVotingType == 1 ? "On Sender" : "On Voting Data")
  } catch (err) { console.log('getDoubleVotingGuard', err); message += 'No getDoubleVotingGuard method found!\n' }

  // quorum 
  try {
    let [value, inUnitsOf] = await votingContract.getQuorum(identifier)
    votingInstanceExternalInfo.quorum = { value: value.toString(), inUnitsOf: inUnitsOf.toString() }
  } catch (err) { console.log('getDoubleVotingGuard', err); message += 'No getQuorum method found!\n' }

  // implementing permitted
  try {
    let implementingPermitted = await votingContract.implementingPermitted(identifier)
    votingInstanceExternalInfo.implementingPermitted = implementingPermitted
  } catch (err) { console.log('implementingPermitted', err); message += 'No implementingPermitted method found!\n' }

  console.log(message)
  return votingInstanceExternalInfo
}



export {
  URL_PLAYGROUND_ABI,
  getABI,
  getPlaygroundABI,
  getGeneralVotingInterface,
  getVotingRegistryInterface,
  getContractAddress,
  getPlaygroundInterface,
  getPlaygroundViewFunctionsFromInterface,
  getPlaygroundMutableFunctionsFromInterface,
  getRegisteredVotingContracts,
  getPlaygroundAddress,
  getPlaygroundContract,
  getVotingInstanceExternalInfo,
  getPlaygroundInstancesFromEvents,
  getBlockexplorerBaseUrlFromChainId,
  getContractABIFromEtherscan,
  getContractAddressesForAllChains,
  ErcInterfaceFlags,
  TokenInfo,
  TargetInterface,
  VotingInstanceInfo,
  InstancePointer,
  InstanceInternalInfo,
  VotingInstanceExternalInfo,
  InstanceInternalInfoAndPointer,
  DoubleVotingGuard
}