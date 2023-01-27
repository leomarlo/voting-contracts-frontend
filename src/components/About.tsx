import React, { CSSProperties } from "react";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"

interface AboutArgs {
  detailsHandling: DetailsHandling
}

const linkStyle: CSSProperties = { color: 'lightcoral', fontWeight: "bold" }

const AboutComp: React.FC<AboutArgs> = ({ detailsHandling }: AboutArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.About]



  const title: string = "What are Configurable Voting Contracts"
  return (
    <div key={thisPageInfo.key}>
      <h3> What is our mission?</h3>
      <p>
        We make on-chain voting configurable, modularizable, pluggable and secure.
        The key idea behind configurable voting contracts is to outsource the voting functionality
        in much the same way as one would outsource a token contract. This comes with many advantages.
        First of all the separation of the voting logic from the logic of a contract that integrates voting (e.g. a DAO) allows
        for them to be updated or replugged, respectively. Second, there is no need to hardcode the same type of voting functionality
        into thousands of DAOs yet to come. Third, the changing demands on voting functionality can be accounted for by adding ever new types
        of voting contracts, such as token-weighted voting, delegate voting, quadratic voting etc.
      </p>
      <p>
        This platform aims to fulfil three purposes. First we propose a standard for configurable voting contracts which is exposed <span>here</span>,
        second the platform provides an easy way to build both voting contracts that obey the standard aswell as <span>interfacing</span> them inside of your target contract, i.e. integration.
        Lastly there is a <span>playground</span> that serves the purpose of familiarizing yourself with the idea of voting contracts.
      </p>
      <h3>Page content</h3>
      Please find th following information on this page:
      <ol>
        <li>
          <span style={linkStyle} onClick={(e) => { detailsHandling.pageSetter(Pages.VotingContracts) }}>
            Voting Contracts
          </span>
        </li>
        <li>
          <span style={linkStyle} onClick={(e) => { detailsHandling.pageSetter(Pages.VotingContractIntegration) }}>
            Integration
          </span>
        </li>
        <li>
          <span style={linkStyle} onClick={(e) => { detailsHandling.pageSetter(Pages.VotingRegistrySystem) }}>
            Registry
          </span>
        </li>
        <li>
          <span style={linkStyle} onClick={(e) => { detailsHandling.pageSetter(Pages.VotingPlayground) }}>
            Playground
          </span>
        </li>
        <li>
          <span style={linkStyle} onClick={(e) => { detailsHandling.pageSetter(Pages.Documentation) }}>
            Documentation
          </span>
        </li>
      </ol>


    </div>
  )
}

export {
  AboutComp
}