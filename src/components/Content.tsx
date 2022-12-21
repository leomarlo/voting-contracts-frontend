// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"
import { StandardReadWriteCard, StandardReadWriteCardArgs } from "./cards/StandardReadWrite"
import { FocusOnDetailsVarAndSetter } from "../types/components"


// import * as VotingPlayground from '@leomarlo/voting-registry-contracts/src/examples/playground/Playground.sol/VotingPlayground.json' assert { type: "json" };
import votingPlaygroundABI from '../abis/VotingPlayground'

const contentStyle = {
  overflowY: "auto",
  height: "90%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}

interface ContentArgs {
  focusOnDetails: FocusOnDetailsVarAndSetter
}

const Content: React.FC<ContentArgs> = ({ focusOnDetails }: ContentArgs) => {

  const { account, library } = useWeb3React<ethers.providers.Web3Provider>()
  const [receipt, setReceipt] = useState("");
  const [balance, setBalance] = useState("");
  const [displayBalance, setDisplayBalance] = useState("");

  const ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function mint(uint256 amount) external"
  ]

  const changeFocusInMain = () => {
    focusOnDetails.flag ? focusOnDetails.setter(false) : focusOnDetails.setter(true)
  }


  const toyTokenAddress = "0xCE30daB6b92acc1167aDA02F5214269217236CFe"

  const mint = async () => {
    let signer: ethers.providers.JsonRpcSigner | undefined = library?.getSigner()
    let token = new ethers.Contract(toyTokenAddress, ABI, signer)
    let receipt = await token.mint(ethers.utils.parseEther("1.5"))
    let txReceipt = JSON.stringify(await receipt.wait())
    setReceipt(txReceipt)
    let newBalance = ethers.utils.formatEther(await token.balanceOf(account))
    setBalance(newBalance)
    displayBalanceFunction('current')
    console.log('new Balance', newBalance)
    console.log(votingPlaygroundABI)
  }

  const displayBalanceFunction = (action: string) => {
    console.log(votingPlaygroundABI)
    // console.log(JSON.stringify(getPlaygroundABI()))
    if (action == 'current') {
      setDisplayBalance(balance)
    } else if (action == 'clear') {
      setDisplayBalance("")
    }
  }

  const allFunctions = votingPlaygroundABI.map((method, i) => {
    let marginTop = (i == 0) ? 0 : 3
    let headerColor = ""
    if (method.stateMutability == 'nonpayable') {
      headerColor = "warning"
    } else if (method.stateMutability == "payable") {
      headerColor = "danger"
    } else if (method.stateMutability == "view") {
      headerColor = "secondary"
    } else {
      headerColor = "info"
    }
    const title = (method.name) ? method.name : "No title"
    return (
      <StandardReadWriteCard
        callback={changeFocusCallback}
        buttonType="secondary"
        cardText={JSON.stringify(method)}
        cardTitle={title}
        headerColor={headerColor}
        marginTop={marginTop}
        marginBottom={0}
      />
    )
  })


  return (
    <div style={{
      overflowY: "auto",
      height: "800px"
    }}>
      <h1>Header</h1>
      <br />
      <p>Your current balance is: {displayBalance}</p>
      <br />
      <p>The last transaction receipt reads:</p><br />
      {receipt}
      <br />
      <BasicButton buttonType="info" text="Display Current Balance" onClick={() => displayBalanceFunction('current')} />
      <br />
      <BasicButton buttonType="danger" text="Clear Balance" onClick={() => displayBalanceFunction('clear')} />
      <br />
      <BasicButton buttonType="success" text="Mint 1.5 Eth" onClick={mint} />
      <br /><br /><br />
      {/* <StandardReadWriteCard
        callback={changeFocusCallback}
        buttonType="secondary"
        cardText="Hello"
        cardTitle="Some Title"
        headerColor="warning"
        marginTop={3}
        marginBottom={2}
      /> */}
      <br />
      {allFunctions}
    </div>
  )
}

export {
  Content
}