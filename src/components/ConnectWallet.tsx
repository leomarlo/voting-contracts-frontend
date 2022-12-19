// ConnectWallet.tsx

import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector';
import { UserRejectedRequestError } from '@web3-react/injected-connector'


const buttonStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}


const ConnectWallet = () => {
  const injectedConnector = new InjectedConnector(
    {
      supportedChainIds: [
        1, // Mainnet
        5, // Goerli
        137, // Polygon
        80001, // Mumbai
        1337802, // Kiln
        11155111 // Sepolia
      ]
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
