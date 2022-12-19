// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"

const contentStyle = {
  overflowY: "auto",
  height: "90%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}


const Content: React.FC = () => {

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
    console.log('TX Receipt!', txReceipt)
    console.log('new Balance', newBalance)
  }

  const displayBalanceFunction = (action: string) => {
    if (action == 'current') {
      setDisplayBalance(balance)
    } else if (action == 'clear') {
      setDisplayBalance("")
    }
  }

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
      <BasicButton buttonType="info" text="Display Current Balance" onClick={() => displayBalanceFunction('current')} />
      <BasicButton buttonType="danger" text="Clear Balance" onClick={() => displayBalanceFunction('clear')} />
      <BasicButton buttonType="success" text="Mint 1.5 Eth" onClick={mint} />

    </div>
  )
}

export {
  Content
}