// Info.tsx

import React, { useEffect, useState } from 'react'
import { formatAddress } from '../utils/format'
import { ethers } from 'ethers'
import { reverseResolveChainId } from "../utils/chains"
import { useWeb3React } from '@web3-react/core';


const infoStyle = {
  minWidth: "150px",
  minHeight: "45px",
  padding: "5px",
  borderRadius: "8px"
}

interface AccountInfo {
  active: boolean;
  content1: string;
  content2?: string
}

const getAccountInfo: React.FC<AccountInfo> = ({ active, content1, content2 }: AccountInfo) => {
  if (active) {
    return (
      <div>
        <div style={{ width: "30%", float: "left" }}>{content1}</div>
        <div style={{ width: "70%", float: "right", textAlign: "right" }}>{content2}</div>
      </div>
    )
  } else {
    return (
      <div>
        <div style={{ textAlign: "left" }}>{content1}</div>
      </div>
    )
  }
}

const Info: React.FC = () => {

  const {
    chainId,
    account,
    active
  } = useWeb3React<ethers.providers.Web3Provider>();

  const pleaseConnect: string = "Please connect your account!     \u261B"
  const [addressInfo, setAddressInfo] = useState<string>(pleaseConnect)
  const [chainInfo, setChainInfo] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (chainId && account) {
      setAddressInfo(`Address: ${account}`)
      setChainInfo(`Chain: ${reverseResolveChainId[chainId]} (${chainId})`)
    } else {
      setAddressInfo(pleaseConnect)
      setChainInfo(undefined)
    }
  }, [active, chainId, account])


  return (
    <div className="border border-warning border-3" style={infoStyle}>
      {/* {accountInfo} */}
      {addressInfo}
      {chainInfo ?
        <>
          <br />
          {chainInfo}
        </> :
        <></>}
    </div>
  )
}

export {
  Info
}