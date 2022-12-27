import React from "react";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"

interface VotingIntegrationArgs {
  detailsHandling: DetailsHandling
}

const VotingIntegrationComp: React.FC<VotingIntegrationArgs> = ({ detailsHandling }: VotingIntegrationArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.VotingContractIntegration]

  const Details = (
    <>
      <div style={{ backgroundColor: "cornflowerblue" }} className="card">
        Details
      </div>
    </>
  )
  return (
    <div key={thisPageInfo.key}>
      <h3>{thisPageInfo.title}</h3>
      <p>
        This app exposes an example of a <a href="https://github.com/leomarlo/voting-registry-contracts/tree/development/src/examples/integrations">voting contract integration</a>.<br />
        Any contract which can call voting contracts directly or indirectly (as part of its interface) is called a voting contract integration (Please read the information on voting contract integrations).
      </p>
      <button onClick={() => detailsHandling.detailsSetter(Details)}>Click me</button>
    </div>
  )
}

export {
  VotingIntegrationComp
}