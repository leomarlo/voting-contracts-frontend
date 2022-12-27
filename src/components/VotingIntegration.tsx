import React from "react";
import { FocusOnDetailsVarAndSetter } from "../types/components"
import { PageInfo, Pages, pageInfo } from "../utils/pages"

interface VotingIntegrationArgs {
  focusOnDetails: FocusOnDetailsVarAndSetter
}

const VotingIntegrationComp: React.FC<VotingIntegrationArgs> = ({ focusOnDetails }: VotingIntegrationArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.VotingContractIntegration]
  return (
    <div key={thisPageInfo.key}>
      <h3>{thisPageInfo.title}</h3>
      <p>
        This app exposes an example of a <a href="https://github.com/leomarlo/voting-registry-contracts/tree/development/src/examples/integrations">voting contract integration</a>.<br />
        Any contract which can call voting contracts directly or indirectly (as part of its interface) is called a voting contract integration (Please read the information on voting contract integrations).
      </p>
    </div>
  )
}

export {
  VotingIntegrationComp
}