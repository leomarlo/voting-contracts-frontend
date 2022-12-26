// ConnectWallet.tsx

import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector';
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { supportedChainIds } from '../utils/chains'
import type { MetaMask } from "@web3-react/metamask"
import VotingPlayground from "../abis/VotingPlayground"

const buttonStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}
// using help of https://dev.to/yakult/tutorial-build-dapp-with-web3-react-and-swr-1fb0

const ConnectWallet = () => {
  const injectedConnector = new InjectedConnector(
    {
      supportedChainIds: supportedChainIds
    }
  );
  const {
    chainId,
    account,
    activate,
    deactivate,
    active,
    setError,
    library
  } = useWeb3React<Web3Provider>();


  const onClickConnect = async () => {
    // let res = await injectedConnector.activate();
    // let signer = await provider.getSigner()
    // console.log(res)
    // activate(injectedConnector)

    // if (window.ethereum) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const signer = provider.getSigner()
    //   const address = await signer.getAddress()
    //   let pg = new ethers.Contract('0x4BF632e194D498F733d256AB13183004eA428788', VotingPlayground, signer)
    //   let votingRegistry = await pg.VOTING_REGISTRY()
    //   console.log('votingRegistry', votingRegistry) //ethers.utils.formatEther(await signer.getBalance()))
    // }

    activate(injectedConnector, (error) => {
      if (error instanceof UserRejectedRequestError) {
        // ignore user rejected error
        console.log("user refused")
      } else {
        setError(error)
      }
    }, false)
  };

  const onClickDisconnect = () => {
    deactivate()
  }

  useEffect(() => {
    console.log(chainId, account, active);
  });

  return (
    <div>
      {active ? (
        <button
          type="button"
          className="btn btn-outline-success"
          style={buttonStyle}
          onClick={onClickDisconnect}>
          Disconnect
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-outline-danger"
          style={buttonStyle}
          onClick={onClickConnect}>
          Connect
        </button>
      )}
    </div>
  );
};

export {
  ConnectWallet
};
