// Info.tsx

import React, { useEffect } from 'react'
import { formatAddress } from '../utils/format'
import { ethers } from 'ethers'
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


  let accountInfo: AccountInfo = {} as AccountInfo
  accountInfo.active = active
  if (active) {
    accountInfo.content1 = "Address:"
    accountInfo.content2 = formatAddress(account as string, 6)
  } else {
    accountInfo.content1 = "Please connect your account!     \u261B"
  }

  return (
    <div className="border border-warning border-3" style={infoStyle}>
      {/* {accountInfo} */}
      {getAccountInfo(accountInfo)}
    </div>
  )
}

export {
  Info
}