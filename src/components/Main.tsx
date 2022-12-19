// Main.tsx

import React from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"

const mainStyle = {
  zIndex: 2,
  width: "100vw",
  minHeight: "95%",
  maxHeight: "95%",
  top: "5%",
  overflow: "hidden",
  left: 0
}

const menuStyle = {
  zIndex: 2,
  paddingLeft: "24px",
  paddingRight: "14px",
  paddingTop: "54px",
  paddingBottom: "14px",
}


const Main: React.FC = () => {
  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}></div>
        <Menu />
      </div>
      <div className="col-10">
        {/* {endlesstext} */}
        <Content />
      </div>
    </div>
  )
}

export {
  Main
}