// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"

// import * as VotingPlayground from '@leomarlo/voting-registry-contracts/src/examples/playground/Playground.sol/VotingPlayground.json' assert { type: "json" };
import votingPlaygroundABI from '../abis/VotingPlayground'

// console.log(votingPlaygroundABI)


const detailsStyle = {
  overflowY: "auto",
  height: "90%"
}


const Details: React.FC = () => {

  return (
    <div style={{
      overflowY: "auto",
      height: "800px"
    }}>

    </div>
  )
}

export {
  Details
}