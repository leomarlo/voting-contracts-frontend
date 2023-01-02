import { ethers } from "ethers"
import { reverseResolveChainId } from "../utils/chains"
import deploymentInfo from "../deployment/deploymentInfo.json"
import { hexValue } from "ethers/lib/utils"
import axios from 'axios'
import votingContractABI from '../abis/GeneralVotingContract'

const PROTOCOL = "https://"
const BASE_URL = "raw.githubusercontent.com/leomarlo/voting-registry-contracts"
const BRANCH = "development"
const URL_PLAYGROUND_ABI = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/examples/playground/Playground.sol/VotingPlayground.json"
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
  "function symbol() external view returns (string)"
]
const TOKEN_WITH_ERC165_INTERFACE = TOKEN_MINIMAL_ABI.concat([
  "function supportsInterface(bytes4) external view returns (bool)"
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

  console.log('inside getPlaygroundABI')
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

const getPlaygroundInterface = async () => {
  return await getEthersInterface(URL_PLAYGROUND_ABI)
}



const getContract = async (chainId: number, contractName: string, abi: Array<Object>) => {
  let address = await getContractAddress(chainId, contractName)
  return new ethers.Contract(address, abi)
}

const getPlaygroundContract = async (chainId: number) => {
  console.log('inside getPlaygroundContract')
  return getContract(chainId, "VotingPlayground", await getPlaygroundABI())
}

const getContractAddress = async (chainId: number, contractName: string) => {

  let flag = false
  let networkName = reverseResolveChainId[chainId as number] as string
  let info = flag ? await getDeploymentInfo() : deploymentInfo
  let deploymentInfoNetwork = info[networkName as keyof typeof info]
  return deploymentInfoNetwork[contractName].address
}

const getPlaygroundAddress = async (chainId: number) => {
  return await getContractAddress(chainId, "VotingPlayground")
}

interface ErcInterfaceFlags {
  erc165: boolean,
  erc721: boolean,
  erc1155: boolean,
}

interface TokenInfo {
  name: string,
  symbol: string,
  address: string,
  interfaces: ErcInterfaceFlags
}
enum DoubleVotingGuard { none, onSender, onVotingData }

interface VotingInstanceExternalInfo {
  votingContract: ethers.Contract,
  identifier: ethers.BigNumber,
  deadline: string | undefined,
  ttl: number | undefined,
  status: string | undefined,
  token: TokenInfo | undefined,
  doubleVotingGuard: DoubleVotingGuard | undefined,
  quorum: { value: string, inUnitsOf: string } | undefined
}

interface TargetInterface {
  id: string | undefined,
  name?: string,
  isFunction: boolean
}

interface InstanceInternalInfo {
  index: number,
  sender: string | undefined,
  target: TargetInterface
}

interface InstancePointer {
  identifier: ethers.BigNumber,
  votingContractAddress: string
}

type InstanceInternalInfoAndPointer = InstanceInternalInfo & InstancePointer;

type VotingInstanceInfo = InstanceInternalInfo & InstancePointer & VotingInstanceExternalInfo;

const getPlaygroundInstancesFromEvents = async (playgroundContract: ethers.Contract) => {
  let flt = playgroundContract.filters.VotingInstanceStarted(null, null, null)
  // console.log(eventsRes)
  const events = await playgroundContract.queryFilter(flt)
  return events.map((e) => {
    let targetId: string = e.args?.target
    let target: TargetInterface = {
      id: targetId,
      isFunction: targetId.length < (2 + 2 * 4)
    }
    if (target.isFunction) {
      target.name = playgroundContract.interface.getFunction(targetId).name
    }
    let instanceInternalInfo: InstanceInternalInfo = { index: e.args?.index, sender: e.args?.sender, target: target }
    return instanceInternalInfo
  })
}

const getVotingInstanceExternalInfo = async (signer: ethers.providers.JsonRpcSigner, votingContractAddress: string, votingContractABI: Array<Object>, identifier: ethers.BigNumber) => {

  console.log('identifier', identifier)

  let votingInstanceExternalInfo = {} as VotingInstanceExternalInfo
  let message = ''
  // instantiate contract 
  let votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer)

  // save contract instance into external info object
  votingInstanceExternalInfo.votingContract = votingContract

  // identifier
  votingInstanceExternalInfo.identifier = identifier

  // deadline
  try {
    let deadlineInSeconds = (await votingContract.getDeadline(identifier)).toNumber()
    votingInstanceExternalInfo.deadline = (new Date(deadlineInSeconds * 1000)).toLocaleString();
    let currentTimeInSeconds = Math.floor(Date.now() / 1000)
    votingInstanceExternalInfo.ttl = Math.max(deadlineInSeconds - currentTimeInSeconds, 0)
  } catch (err) { console.log('getDeadline', err); message += 'No getDeadline method found!\n' }

  // status
  try {
    let status = (await votingContract.getStatus(identifier))
    votingInstanceExternalInfo.status = status.toString()
  } catch (err) { console.log('getStatus', err); message += 'No getStatus method found!\n' }

  // token
  try {
    let tokenInfo = {} as TokenInfo
    let tokenAddress = await votingContract.getToken(identifier)
    tokenInfo.address = tokenAddress
    try {
      let tokenInterface = new ethers.Contract(tokenAddress, TOKEN_WITH_ERC165_INTERFACE, signer)
      let name = (await tokenInterface.name())
      let symbol = (await tokenInterface.symbol())
      tokenInfo.name = name
      tokenInfo.symbol = symbol
      let interfaces = {} as ErcInterfaceFlags
      try {
        let supports_erc165 = await tokenInterface.supportsInterface(ERC165_ID)
        let supports_erc721 = await tokenInterface.supportsInterface(ERC721_ID)
        let supports_erc1155 = await tokenInterface.supportsInterface(ERC1155_ID)
        interfaces = {
          erc165: supports_erc165,
          erc721: supports_erc721,
          erc1155: supports_erc1155
        }
        tokenInfo.interfaces = interfaces
      } catch (err) { console.log('supportsInterface', err); message += 'No supportsInterface found method found!\n' }
    } catch (err) { console.log('token name', err); message += 'No token name or symbol found method found!\n' }
    votingInstanceExternalInfo.token = tokenInfo
  } catch (err) { console.log('getToken', err); message += 'No getToken method found!\n' }

  // double voting
  try {
    let doubleVotingType = (await votingContract.getDoubleVotingGuard(identifier)) as DoubleVotingGuard
    votingInstanceExternalInfo.doubleVotingGuard = doubleVotingType
  } catch (err) { console.log('getDoubleVotingGuard', err); message += 'No getDoubleVotingGuard method found!\n' }

  // quorum 
  try {
    let [value, inUnitsOf] = await votingContract.getQuorum(identifier)
    votingInstanceExternalInfo.quorum = { value: value.toString(), inUnitsOf: inUnitsOf.toString() }
  } catch (err) { console.log('getDoubleVotingGuard', err); message += 'No getQuorum method found!\n' }


  console.log(message)
  return votingInstanceExternalInfo
}



export {
  URL_PLAYGROUND_ABI,
  getABI,
  getPlaygroundABI,
  getGeneralVotingInterface,
  getContractAddress,
  getPlaygroundAddress,
  getPlaygroundContract,
  getVotingInstanceExternalInfo,
  getPlaygroundInstancesFromEvents,
  TargetInterface,
  VotingInstanceInfo,
  InstancePointer,
  InstanceInternalInfo,
  VotingInstanceExternalInfo,
  InstanceInternalInfoAndPointer
}