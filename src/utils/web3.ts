import { ethers } from "ethers"
import { reverseResolveChainId } from "../utils/chains"
import deploymentInfo from "../deployment/deploymentInfo.json"
// import axios from 'axios'
const axios = require('axios')
const URL_PLAYGROUND_ABI = "https://raw.githubusercontent.com/leomarlo/voting-registry-contracts/development/artifacts/src/examples/playground/Playground.sol/VotingPlayground.json"
const URL_DEPLOYMENT_INFO = "https://raw.githubusercontent.com/leomarlo/voting-registry-contracts/development/scripts/verification/deploymentArgs/deploymentInfo.json"

const getABI = async (url: string) => {
  let res = await axios.get(url)
  return res.data.abi
}

const getDeploymentInfo = async () => {
  let res = await axios.get(URL_DEPLOYMENT_INFO)
  return res.data
}

const getPlaygroundABI = async () => {
  return await getABI(URL_PLAYGROUND_ABI)
}

const getEthersInterface = async (url: string) => {
  let abi: Array<Object> = await getABI(url)
  return new ethers.utils.Interface(abi)
}

const getPlaygroundInterface = async () => {
  return await getEthersInterface(URL_PLAYGROUND_ABI)
}



const getContract = async (chainId: number, contractName: string, abi: Array<Object>) => {
  let address = await getContractAddress(chainId, contractName)
  return new ethers.Contract(address, abi)
}

const getPlaygroundContract = async (chainId: number) => {
  return getContract(chainId, "VotingPlayground", await getPlaygroundABI())
}

const getContractAddress = async (chainId: number, contractName: string) => {
  let flag = true
  let networkName = reverseResolveChainId[chainId as number] as string
  let info = flag ? await getDeploymentInfo() : deploymentInfo
  let deploymentInfoNetwork = info[networkName as keyof typeof info]
  return deploymentInfoNetwork[contractName].address
}

const getPlaygroundAddress = async (chainId: number) => {
  return await getContractAddress(chainId, "VotingPlayground")
}

export {
  getABI,
  getPlaygroundABI,
  getContractAddress,
  getPlaygroundAddress,
  getPlaygroundContract
}