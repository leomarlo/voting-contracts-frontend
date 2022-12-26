// Dapp.tsx

import React from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers'
import { ConnectWallet } from './components/ConnectWallet'
import { Canvas } from './components/Canvas'
import { Navbar } from './components/Navbar'
import { Main } from './components/Main'

import "./styles/main.css";

function getLibrary(provider: any) {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 12000;
  return library;
}




const Dapp: React.FC = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="container-fluid">
        <Canvas />
        <Navbar />
        <Main />
      </div>
    </Web3ReactProvider>
  );
};

export { Dapp };
