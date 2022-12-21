// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"
import { StandardReadWriteCard, StandardReadWriteCardArgs, FormReadWriteCard } from "./cards/StandardReadWrite"
import { FocusOnDetailsVarAndSetter } from "../types/components"
import { SimpleForm } from "./forms/SimpleForm"
import { reverseResolveChainId } from "../utils/chains"
import { InputDataOneEntry } from "../types/components"

// import * as VotingPlayground from '@leomarlo/voting-registry-contracts/src/examples/playground/Playground.sol/VotingPlayground.json' assert { type: "json" };
import votingPlaygroundABI from '../abis/VotingPlayground'
import deploymentInfo from "../deployment/deploymentInfo.json"
import VotingPlayground from "../abis/VotingPlayground"

const contentStyle = {
  overflowY: "auto",
  height: "90%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}

interface VotingPlaygroundArgs {
  focusOnDetails: FocusOnDetailsVarAndSetter
}

interface InterfaceAndContract {
  interface: any,
  contract: any
}

type FormValues = Array<Array<string>>

const VotingPlaygroundComp: React.FC<VotingPlaygroundArgs> = ({ focusOnDetails }: VotingPlaygroundArgs) => {

  const { account, chainId, library } = useWeb3React<ethers.providers.Web3Provider>()


  const [formValues, setFormValues] = useState<FormValues>([])

  const changeFocusInMain = () => {
    focusOnDetails.flag ? focusOnDetails.setter(false) : focusOnDetails.setter(true)
  }

  // const votingContractInfos: Array<{ [key: string]: any }> = []
  // if (chainId) {
  //   let networkName = reverseResolveChainId[chainId as number] as string
  //   let deploymentInfoNetwork = deploymentInfo[networkName as keyof typeof deploymentInfo]
  // keyof typeof deploymentInfo


  // if ("PlainMajorityVoteWithQuorum" in deploymentInfoNetwork) {
  const getVotingPlayground = () => {
    let result: InterfaceAndContract = {
      interface: new ethers.utils.Interface(votingPlaygroundABI),
      contract: null
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

  const testCallback = (ind: number) => {
    console.log('Halooe', ind)
    // for (let n = 0; n < formValues[ind].length; n++) {
    //   console.log(`The ${n}-th value of field ${ind} is ${formValues[ind][n]}`)
    // }
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


    let inputNames = method.inputs?.map((e) => (e.name)) as Array<string>
    let inputTypes = method.inputs?.map((e) => (e.type)) as Array<string>
    let inputData: Array<InputDataOneEntry> = []
    let inputValues: Array<string> = []
    for (let k = 0; k < inputNames.length; k++) inputValues.push("")
    // setFormValues([...formValues, inputValues])
    console.log('The input values are ', inputValues)
    for (let k = 0; k < inputNames.length; k++) {

      let newInputData: InputDataOneEntry = {
        label: inputNames[k],
        specification: inputTypes[k],
        // value: formValues[i][k],
        value: inputValues[k]
      }
      inputData.push(newInputData)
    }




    if (votingMethods.includes(method.name as string)) {

      let marginTop = (index.votingMethods == 0) ? 0 : 3
      let headerColor = (method.stateMutability == 'payable') ? "danger" : "warning"

      allVotingMethods.push(
        <FormReadWriteCard
          identifier={method.name as string}
          buttonCallback={() => testCallback(i)}
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
          <FormReadWriteCard
            identifier={method.name as string}
            buttonCallback={() => testCallback(i)}
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
          <FormReadWriteCard
            identifier={method.name as string}
            // buttonCallback={changeFocusInMain}
            buttonCallback={() => testCallback(i)}
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