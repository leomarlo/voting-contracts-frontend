// 	Menu.tsx

import React from "react"

import { SelectedPageOptions } from "../types/components"

interface MenuArgs {
  setSelectedPage: any
}

const Menu: React.FC<MenuArgs> = ({ setSelectedPage }: MenuArgs) => {
  return (
    <ul>
      <li key="Overview">Overview</li>
      <li
        key="voting-contracts"
        onClick={() => {
          setSelectedPage("voting-contracts")
        }}>
        Voting Contracts</li>
      <li key="voting-registry">Voting Registry</li>
      <li key="voting-registrar">Voting Registrar</li>
      <li key="voting-playground" onClick={() => { setSelectedPage("voting-playground") }}>Voting Playground</li>
    </ul>
  )
}

export {
  Menu
}