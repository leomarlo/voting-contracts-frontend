// 	Menu.tsx

import React from "react"

import { SelectedPage } from "../types/components"

interface MenuArgs {
  setSelectedPage: any
}

const Menu: React.FC<MenuArgs> = ({ setSelectedPage }: MenuArgs) => {
  return (
    <ul>
      <li>Overview</li>
      <li onClick={() => {
        setSelectedPage("voting-contracts")
        // console.log("You clicked me!")
      }}>Voting Contracts</li>
      <li>Voting Registry</li>
      <li>Voting Registrar</li>
      <li onClick={() => { setSelectedPage("voting-playground") }}>Voting Playground</li>
    </ul>
  )
}

export {
  Menu
}