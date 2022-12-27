// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"
import { StandardReadWriteCard, StandardReadWriteCardArgs } from "./cards/StandardReadWrite"
import { reverseResolveChainId } from "../utils/chains"
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"


import majorityVoteWithNft from "../abis/MajorityVoteWithNFTQuorumAndOptionalDVGuard"
import plainMajority from "../abis/PlainMajorityVoteWithQuorum"
import deploymentInfo from "../deployment/deploymentInfo.json"
import { Info } from "./Info"

const contentStyle = {
  overflowY: "auto",
  height: "90%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}

interface VotingContractsArgs {
  detailsHandling: DetailsHandling
}

const VotingContractsComp: React.FC<VotingContractsArgs> = ({ detailsHandling }: VotingContractsArgs) => {

  const { account, chainId, library } = useWeb3React<ethers.providers.Web3Provider>()

  const changeFocusInMain = () => {
    detailsHandling.focusOnDetails ? detailsHandling.focusOnDetailsSetter(false) : detailsHandling.focusOnDetailsSetter(true)
  }

  const votingContractInfos: Array<{ [key: string]: any }> = []
  if (chainId) {
    let networkName = reverseResolveChainId[chainId as number] as string
    let deploymentInfoNetwork = deploymentInfo[networkName as keyof typeof deploymentInfo]
    // keyof typeof deploymentInfo


    if ("PlainMajorityVoteWithQuorum" in deploymentInfoNetwork) {
      votingContractInfos.push({
        abi: plainMajority,
        "info": deploymentInfoNetwork["PlainMajorityVoteWithQuorum"],
        "name": "PlainMajorityVoteWithQuorum"
      })
    }
    if ("MajorityVoteWithNFTQuorumAndOptionalDVGuard" in deploymentInfoNetwork) {
      votingContractInfos.push({
        abi: plainMajority,
        "info": deploymentInfoNetwork["MajorityVoteWithNFTQuorumAndOptionalDVGuard"],
        "name": "MajorityVoteWithNFTQuorumAndOptionalDVGuard"
      })
    }
  }

  const allVotingContracts = votingContractInfos.map((entry, i) => {
    let marginTop = (i == 0) ? 0 : 3
    let headerColor = "warning"
    let title = entry.name
    return (
      <StandardReadWriteCard
        identifier={"VotingContract" + i}
        buttonCallback={changeFocusInMain}
        buttonType="secondary"
        cardBody={entry.info.address}
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
      <h1>Voting Contracts</h1>
      <br />
      {allVotingContracts}
    </div>
  )
}

export {
  VotingContractsComp
}