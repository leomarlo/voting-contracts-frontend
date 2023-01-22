// Content.tsx

import { useWeb3React } from "@web3-react/core"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { BasicButton } from "./buttons/BasicButton"
import { StandardReadWriteCard, StandardReadWriteCardArgs } from "./cards/StandardReadWrite"
import { reverseResolveChainId } from "../utils/chains"
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"


import majorityVoteWithNft from "../abis/MajorityVoteWithNFTQuorumAndOptionalDVGuard"
import plainMajority from "../abis/PlainMajorityVoteWithQuorum"
import deploymentInfo from "../deployment/deploymentInfo.json"
import { Info } from "./Info"

const contentStyle = {
  overflowY: "auto",
  height: "90%"
}

const transactStyle = {
  borderWidth: "3px",
  minWidth: "200px",
  minHeight: "45px"
}


enum VotingContractSections {
  VotingContractStandard = "Voting Contract Standard",
}

type VotingContractSectionFlags = { [section in VotingContractSections]: boolean }
type VotingContractSectionContents = { [section in VotingContractSections]: JSX.Element }

interface VotingContractsArgs {
  detailsHandling: DetailsHandling
}


const VotingContractStandardElement: JSX.Element = (
  <>
    <p>The objective of a voting contract standard is to facilitate usage across diverse applications, to allow adoption and
      inter-operatability and to increase trust.</p>
    <p>The voting contract should implement at least three function:</p>
    <ol>
      <li><code>start</code></li>
      <li><code>vote</code></li>
      <li><code>result</code> (view)</li>
    </ol>
    <p>We <code>RECOMMEND</code> that it also implement these functions:</p>
    <ol>
      <li><code>implement</code> (optional)</li>
      <li><code>encodeVotingParams</code> (view, optional)</li>
      <li><code>decodeVotingParams</code> (view, optional)</li>
    </ol>
    <p>and any set of extensions.</p>
    <h5 id="start-a-voting-instance">Start a Voting Instance</h5>
    <p>The start function should create a new voting instance. Two arguments should be passed to it, namely <code>bytes memory votingParams</code> and <code>bytes calldata callback</code>. The <code>uint256 identifier</code>
      of the instance should be returned:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function start(bytes memory votingParams, bytes calldata callback) external returns(uint256 identifier);
    </code></pre>
    <p>The configuration of the voting instance should be passed through the <code>votingParams</code>. Parameters could for
      instance be the duration of the vote, a quorum threshold, a majority threshold and in many cases a token address for
      token-weighted votes. The choice of parameter serialization is left as a matter of the contract&#39;s internal
      logic. Typically the configuration is stored at least for the duration of the voting. </p>
    <p>On-chain votes should have on-chain consequences. Those are encoded in the <code>callback</code> argument. It
      contains the calldata for the low-level call triggering the outcome. However, this voting interface could just
      aswell be written without on-chain consequences, simply by ignoring that argument and allowing it to be set to <code>&quot;&quot;</code>. The callback data could either be stored entirely and retrieved once the outcome has been
      determined or it could be hashed and later used as a key to trigger the low-level call. (see Implement the
      Voting Result)</p>
    <p>Once the voting instance has been configured and created a pointer to that instance should be returned. This could be
      a hash that uniquely identifies a voting instance or an index of sorts.</p>
    <h5 id="casting-a-vote">Casting a Vote</h5>
    <p>The vote function should be called to cast a vote. It needs to receive the <code>uint256 identifier </code> as one
      argument and information about the vote via <code>bytes calldata votingData</code>. The current status <code>uint256 status</code> should be returned, so that a calling contract could immediately act upon a
      status-change. To allow for greater flexibility the status is of type <code>uint256</code>. We recommend that the
      first four are reserved to <code>inactive</code>, <code>completed</code>, <code>failed</code> and <code>active</code>.</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function vote(uint256 identifier, bytes calldata votingData) external returns(uint256 status);
    </code></pre>
    <p>Typically one would encode the voter&#39;s choice in the <code>votingData</code>. The options <code>approve</code>, <code>disapprove</code> and <code>abstain</code> could be encoded. Depending on the typ of vote one might also
      choose to leave it blank and consider the bare vote as sufficient indication of preference. When the <code>vote</code>-function is called via a contract rather than directly, the voter&#39;s address should be encoded
      in the <code>votingData</code>. When it is called directly the voter is the <code>msg.sender</code>. One might also
      encode data that can be inserted into the callback. For instance, if the vote is about choosing between several
      candidates, then the candidate address could be passed into the <code>votingData</code>. Care must be taken in the <code>callback</code> argument when defining the bytes range where the option can be inserted. </p>
    <p>In order to follow the recommendation of fixing the first four status categories one <code>MAY</code> define an <code>enum</code> data-type</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">{"enum VotingStatus {inactive, completed, failed, active}"}
    </code></pre>
    <p>that enforces them.</p>
    <h5 id="querying-the-result-of-the-voting-instance">Querying the Result of the Voting Instance</h5>
    <p>There must be a method that can query the result of a voting instance. </p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function result(uint256 identifier) public view returns(bytes memory resultData);
    </code></pre>
    <p>The function should be a <code>view</code> function whose single argument is the <code>uint256 identifier</code> of
      the voting instance. The output <code>bytes memory resultData</code> could be the current status of the vote. Apart
      from the status one could add some information about the aggregated votes, such as the number of approvals,
      disapprovals and abstentions.</p>
    <h5 id="implement-the-voting-result">Implement the Voting Result</h5>
    <p>This standard is really meant for voting with on-chain consequences, but it can also be used like snapshot. The <code>implement</code> function executes the <code>bytes calldata callback</code> directly on the calling contract.
      As arguments it takes the <code>uint256 identifier</code> and the <code>bytes calldata callback</code>. It returns a
      response that can be either <code>successful</code> or <code>unsuccessful</code>. Calls that have not yet been made
      get the state <code>precall</code>.</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      enum Response {"{"}precall, successful, failed{"}"}<br />

      function implement(uint256 identifier, bytes calldata callback) external payable returns(Response response);
    </code></pre>
    <p>The <code>implement</code> function <code>MAY</code> be implemented. Having another contract make low-level calls
      with calldata that it could potentially temper with requires a high level of trust. The voting contract <code>SHOULD NOT</code> be a proxy contract, which would open possible attack vectors. The target contract, that
      calls the <code>implement</code> function <code>SHOULD</code> be able to block calls from a voting instance that
      implements this function. (see Voting Integration). These concerns lead to the suggestion of having
      the <code>implement</code> function as an optional but recommended extension of the minimal voting standard.</p>
  </>
)

const VotingContractsComp: React.FC<VotingContractsArgs> = ({ detailsHandling }: VotingContractsArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.VotingContracts]

  const { account, chainId, library } = useWeb3React<ethers.providers.Web3Provider>()

  const initialDisplaySection: VotingContractSectionFlags = {
    [VotingContractSections.VotingContractStandard]: true
  }

  const sectionContent: VotingContractSectionContents = {
    [VotingContractSections.VotingContractStandard]: VotingContractStandardElement
  }

  const [displaySection, setDisplaySection] = useState<VotingContractSectionFlags>(initialDisplaySection)

  const setDisplayThisSection = (section: VotingContractSections, flag: boolean) => {
    let displaySectionTemp = { ...displaySection }
    displaySectionTemp[section] = flag
    setDisplaySection(displaySectionTemp)
  }

  const changeDisplayThisSection = (section: VotingContractSections) => {
    displaySection[section] ? setDisplayThisSection(section, false) : setDisplayThisSection(section, true);
  }

  return (
    <div style={{
      overflowY: "auto",
      height: "800px",
      paddingLeft: "10px",
      paddingRight: "15px",
      paddingBottom: "15px"
    }}>
      <div key={thisPageInfo.key}>
        <h3>{thisPageInfo.title}</h3>
        <hr />
        {Object.keys(VotingContractSections).filter((v) => isNaN(Number(v))).map((section) => {
          let sc = VotingContractSections[section as keyof typeof VotingContractSections]
          return (
            <>
              <h4
                style={{ cursor: "pointer" }}
                onClick={() => changeDisplayThisSection(sc)}
              >{(displaySection[sc] ? '⯆ ' : '⯈ ') + sc}</h4>
              {displaySection[sc] ? <div style={{ paddingLeft: "30px" }}>{sectionContent[sc]}</div> : <></>}
              <hr />
            </>

          )
        })}
      </div>
    </div>

  )
}

export {
  VotingContractsComp
}