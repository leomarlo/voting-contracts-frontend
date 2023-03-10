// Navbar.tsx

import React from "react"
import { ConnectWallet } from "./ConnectWallet"
import { Info } from "./Info"
import { ReactSVG } from "react-svg";
import "bootstrap/dist/css/bootstrap.min.css";
// import { VotingContractsLogo } from "./icons/Logo"
// import { ReactComponent as Logo } from '../img/Logo.svg';

const navbarStyle = {
  zIndex: 2,
  width: "100vw",
  height: "10%",
  top: 0,
  left: 0,
  paddingTop: "1vh",
  paddingBottom: "1vh",
  paddingLeft: "2vw",
  paddingRight: "2vw"
}

const connectWalletRowStyle = {
  textAlign: "center"
}

const Navbar: React.FC = () => {
  return (
    <div className="row absolute" style={navbarStyle}>
      <div className="col-4">
        <a href="https://discord.gg/zmaxFZa6sb">Join us on Discord</a>
      </div>
      <div className="col-4">
        <Info />
      </div>
      <div className="col-4" style={{ textAlign: "right" }}>
        <ConnectWallet />
      </div>
    </div>
  )
}


export {
  Navbar
}