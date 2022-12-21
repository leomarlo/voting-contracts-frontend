// ConnectWallet.tsx

import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector';
import { UserRejectedRequestError } from '@web3-react/injected-connector'
import { supportedChainIds } from '../utils/chains'

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
  } = useWeb3React<ethers.providers.Web3Provider>();

  const onClickConnect = () => {
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
