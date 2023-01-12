// Content.tsx

import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"
import { StandardReadWriteCard, FormReadWriteCardTest, FormReadWriteCard } from "./cards/StandardReadWrite"
// import { FocusOnDetailsVarAndSetter } from "../types/components"
import { SimpleForm } from "./forms/SimpleForm"
import { reverseResolveChainId } from "../utils/chains"
import { InputDataOneEntry, FormSubmissionCallbackType, DetailsHandling } from "../types/components"
// import * as VotingPlayground from '@leomarlo/voting-registry-contracts/src/examples/playground/Playground.sol/VotingPlayground.json' assert { type: "json" };
import votingPlaygroundABI from '../abis/VotingPlayground'
import deploymentInfo from "../deployment/deploymentInfo.json"
import VotingPlayground from "../abis/VotingPlayground"
import axios from 'axios'
const URL = "https://raw.githubusercontent.com/leomarlo/voting-registry-contracts/development/src/votingContractStandard/IVotingContract.sol"

// const { useProvider } = hooks
// const provider = useProvider()

const contentStyle = {
  overflowY: "auto",
  height: "70%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}

interface VotingPlaygroundArgs {
  detailHandling: DetailsHandling
}

interface InterfaceAndContract {
  interface: ethers.utils.Interface,
  contract: ethers.Contract
}


const VotingPlaygroundComp: React.FC<VotingPlaygroundArgs> = ({ detailHandling }: VotingPlaygroundArgs) => {

  const { account, chainId, library } = useWeb3React<Web3Provider>()

  const tesst = async () => {
    let res = await axios.get(URL)
    console.log(res.data)
  }
  tesst()
  // axios.get(URL).then(res => console.log(res.data)).catch(err => console.log('error', err))

  const changeFocusInMain = () => {
    detailHandling.focusOnDetails ? detailHandling.focusOnDetailsSetter(false) : detailHandling.focusOnDetailsSetter(true)
  }


  // if ("PlainMajorityVoteWithQuorum" in deploymentInfoNetwork) {
  const getContractAddress = (contractName: string) => {
    if (chainId) {
      let networkName = reverseResolveChainId[chainId as number] as string
      let deploymentInfoNetwork = deploymentInfo[networkName as keyof typeof deploymentInfo]
      return deploymentInfoNetwork[contractName as keyof typeof deploymentInfoNetwork].address
    } else {
      throw "cant find contract address"
    }
  }
  const getVotingPlayground = () => {
    let result: InterfaceAndContract = {
      interface: new ethers.utils.Interface(votingPlaygroundABI),
      contract: new ethers.Contract(ethers.constants.AddressZero, [])
    }
    if (chainId) {
      let networkName = reverseResolveChainId[chainId as number] as string
      let deploymentInfoNetwork = deploymentInfo[networkName as keyof typeof deploymentInfo]
      let signer: ethers.providers.JsonRpcSigner | undefined = library?.getSigner()
      if ("VotingPlayground" in deploymentInfoNetwork) {
        let contractName = "VotingPlayground"
        let contractAddress = deploymentInfoNetwork[contractName as keyof typeof deploymentInfoNetwork].address
        result.contract = new ethers.Contract(contractAddress, votingPlaygroundABI, signer)
        return result
      }
    }
    return result
  }

  // make a callbackType
  const testCallback: FormSubmissionCallbackType = async (values: Array<string>, contractFragment: string) => {
    // TODO.. get the playground variable from outside
    const playground = getVotingPlayground()
    // let encoded = playground.interface.encodeFunctionData(contractFragment, values)
    // for (let i = 0; i < values.length; i++) {
    let networkName = reverseResolveChainId[chainId as number] as string
    let deploymentInfoNetwork = deploymentInfo[networkName as keyof typeof deploymentInfo]
    if (library) {
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner()
      const otherSigner = library.getSigner()
      const votingPlaygroundAddress = getContractAddress("VotingPlayground")
      // const playground = new Contract()
      let result = await playground.contract[contractFragment](...values)
    } else {
      console.log('window.ethereum is undefined')
    }
    return null


    if ("VotingPlayground" in deploymentInfoNetwork) {
      let contractName = "VotingPlayground"
      let contractAddress = deploymentInfoNetwork[contractName as keyof typeof deploymentInfoNetwork].address
      // let contract = new ethers.Contract(contractAddress, votingPlaygroundABI, signer)
      // let tx = await contract['badges'](0)
      // let tx = await contract.connect(signer).badges("0")
      // console.log('tx', tx)
    }
    // console.log('values', values)

    //  provider.call({
    //   to: playground.contract.address,
    //   data: encoded
    // })
    //   console.log(`The ${i}-th input is ${values[i]}`)
    // }
    // console.log('encoded', encoded)
    // console.log('tx', tx)
  }

  const playground = getVotingPlayground()
  const votingMethods = ['start', 'vote', 'implement']
  const allVotingMethods = []
  const allReadMethods = []
  const allMutableMethods = []

  let index = { votingMethods: 0, readMethods: 0, mutableMethods: 0 }
  for (let i = 0; i < votingPlaygroundABI.length; i++) {
    let method = votingPlaygroundABI[i]
    if (method.type != "function") continue;
    const title = (method.name) ? method.name : "No title"
    let inputData = method.inputs?.map((e) => { return { label: e.name, specification: e.type, defaultValue: "" } }) as Array<InputDataOneEntry>

    if (votingMethods.includes(method.name as string)) {

      let marginTop = (index.votingMethods == 0) ? 0 : 3
      let headerColor = (method.stateMutability == 'payable') ? "danger" : "warning"

      allVotingMethods.push(
        <FormReadWriteCardTest
          identifier={method.name as string}
          buttonCallback={testCallback}
          buttonType="success"
          buttonText="Submit"
          cardBody=""
          cardTitle={title}
          headerColor={headerColor}
          inputData={inputData}
          marginTop={marginTop}
          marginBottom={0}
        />
      )

      index.votingMethods += 1

    } else {
      if (method.stateMutability == 'nonpayable' || method.stateMutability == 'payable') {
        let marginTop = (index.mutableMethods == 0) ? 0 : 3
        let headerColor = (method.stateMutability == 'payable') ? "danger" : "warning"
        let interfaceId = <p></p>
        if (playground.interface) {
          // inputs.push(<br />)
          interfaceId = <p style={{ textAlign: "right" }}>{"InterfaceID:  " + playground.interface.getSighash(method.name as string)}</p>

        }
        allMutableMethods.push(
          <FormReadWriteCardTest
            identifier={method.name as string}
            buttonCallback={testCallback}
            buttonType="secondary"
            cardBody={interfaceId}
            cardTitle={title}
            inputData={inputData}
            headerColor={headerColor}
            marginTop={marginTop}
            marginBottom={0}
          />
        )
        index.mutableMethods += 1

      } else if (method.stateMutability == 'view') {
        let marginTop = (index.readMethods == 0) ? 0 : 3
        let headerColor = 'secondary'
        allReadMethods.push(
          <FormReadWriteCardTest
            identifier={method.name as string}
            // buttonCallback={changeFocusInMain}
            buttonCallback={testCallback}
            buttonType="success"
            buttonText="Read"
            cardBody=""
            cardTitle={title}
            inputData={inputData}
            headerColor={headerColor}
            marginTop={marginTop}
            marginBottom={0}
          />
        )
        index.readMethods += 1
      }
    }

  }



  return (
    <div style={{
      overflowY: "auto",
      height: "800px"
    }}>
      <h1>Voting Playground</h1>
      <br />
      <h2>Inspect the Contract State</h2>
      {allReadMethods}
      <br />
      <br />
      <h2>Voting Integration</h2>
      {allVotingMethods}
      <br />
      <br />
      <h2>Modify the Contract State</h2>
      {allMutableMethods}
      <br />
    </div>
  )
}

export {
  VotingPlaygroundComp
}