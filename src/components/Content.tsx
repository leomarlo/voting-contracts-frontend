// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect } from "react"
import { ethers } from "ethers"

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

  const { library } = useWeb3React<ethers.providers.Web3Provider>()

  const transact = async () => {
    let signer: ethers.providers.JsonRpcSigner | undefined = library?.getSigner()
    let address = await signer?.getAddress()
    console.log('Boom!', address)
  }

  useEffect(() => {
    let signer: ethers.providers.JsonRpcSigner | undefined = library?.getSigner()
    console.log(signer)
  })

  return (
    <div style={{
      overflowY: "auto",
      height: "800px"
    }}>
      <h1>Header</h1>
      <br />
      <button
        type="button"
        className="btn btn-outline-success"
        style={transactStyle}
        onClick={transact}>
        Transact
      </button>

    </div>
  )
}

export {
  Content
}