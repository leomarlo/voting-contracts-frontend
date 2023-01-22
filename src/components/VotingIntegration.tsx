import React, { useState } from "react";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"


enum VotingIntegrationsSections {
  VotingContractIntegrationInfo = "Voting Contract Integration",
}

type VotingIntegrationSectionFlags = { [section in VotingIntegrationsSections]: boolean }
type VotingIntegrationSectionContents = { [section in VotingIntegrationsSections]: JSX.Element }


interface VotingIntegrationArgs {
  detailsHandling: DetailsHandling
}


const VotingIntegrationElement: JSX.Element = (
  <>
    <p>It is <code>RECOMMENDED</code> to access the voting contracts through a proxy contract, the <em>caller</em>. Ideally
      this is the contract affected by the outcome of the voting. It <code>SHOULD</code> contain two components:</p>
    <ol>
      <li>A security layer that (dis-)allows certain function selectors and voting contracts.</li>
      <li>An interface that connects to the voting contract</li>
    </ol>
    <h5 id="1-function-selectors-and-imposter-voting-contracts">1. Function Selectors and Imposter Voting Contracts</h5>
    <p>One <code>SHOULD</code> add another layer of control and security by providing guards against undesired external
      calls and by specifying which functions may be acted upon through a vote in the first place, in particular from
      which voting contract. </p>
    <p>To mitigate undesired calls the developer <code>SHOULD</code> implement a function that checks whether the alleged
      voting contract is allowed to call the function with selector <code>msg.sig</code>. In other words one needs to
      check whether the calling address <code>msg.sender</code> is approved.</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function _isImplementer(checkIdentifier) internal returns(bool);
    </code></pre>
    <p>This could then also be wrapped into a customized <code>modifier</code> that reverts the call when it is not
      originating from an approved address or has some other customized rights that allows a call. </p>
    <p>It is <code>RECOMMENDED</code> to create a mapping from the <code>bytes4</code> function selector to the <code>address</code> of the assigned voting contract. Approval would need to be handled through the implementing
      contract&#39;s internal logic. The mapping could be called:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">mapping(bytes4=&gt;address) assignedContract;
    </code></pre>
    <p>When starting a new voting instance with <code>bytes votingParams</code> and <code>bytes callback</code>, the voting
      contract is already specified via <code>assignedContract[bytes4(callback[0:4])]</code>. This mapping could then also
      be used to define</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function _isImplementer(checkIdentifier) internal view returns(bool) {"} <br />
      {"    return assignedContract[msg.sig]==msg.sender;"} <br />
      {"}"}
    </code></pre>
    <p>To prevent votes to affect sensitive external functions one can check whether the function selector of the callback
      data has an assigned voting contract:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function _isVotableFunction(bytes4 selector) internal view returns(bool votable){"}< br />
      {"    return assignedContract[selector]!=address(0);"} <br />
      {"}"}
    </code></pre>
    <p>Typically before starting a new instance one shoud check whether the first four bytes of the callback point to a
      votable function. If that is not the case a revert message <code>CAN</code> be implemented. </p>
    <p>In general the <code>assignedContract</code>-mapping gives a high degree of control. In a hypothetical scenario one
      could use for example a <code>simple token-weighted majority</code> for a function <code>foo</code> that decides how
      to allocate funds and for example an <code>m-out-of-n</code> for a function <code>bar</code> that changes a
      contract-specific role.</p>
    <h5 id="2-interface-for-the-voting-contract">2. Interface for the Voting Contract</h5>
    <p>The interface <code>SHOULD</code> contain a <code>start</code> function, <code>MAY</code> contain a <code>vote</code>
      function and <code>MAY</code> contain an <code>implement</code> function. The <code>start</code> function calls the
      standardized start function of a voting contract under the hood and uses customized logic for its return value, the
      <em>identifier</em> of the voting instance so that the <em>caller</em> can point to the instance and may track its
      journey as votes are coming in.</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function start(bytes memory votingParams, bytes calldata callback) external;
    </code></pre>
    <p>The suggested pattern for this function is to first check whether the callback data is secure and then to call the
      voting contract&#39;s start function. If this framework is used as a substitute for snapshot to record votes on the
      chain without triggering on-chain consequences, then empty calldata can be passed and there is no need to check
      whether a votable function is targeted. Otherwise one may use the security pattern to check whether the selector of
      the callback data has an assigned voting contract, e.g. <code>_isVotableFunction(bytes4(callback[0:4]))</code>. One
      may integrate snapshot-type votes or votes with on-chain consequences or both, all in one calling contract. In case
      that all voting instances are supposed to trigger function calls, then it is recommended to recover the voting
      contracts from the <code>assignedContract</code> mapping discussed in the security pattern. In case only
      snapshot-type votes are cast without on-chain consequences -- it would be a bit of an anti-pattern but nevertheless
      possible -- then it might make sense to just store the address of the voting contract in a state variable. In either
      case one can call the voting contract&#39;s start function like so:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function start(bytes memory votingParams, bytes calldata callback) external{"}<br />
      {"    // security guards and custom logic"}  <br />
      {"    uint256 newIdentifier = IVotingContract(votingContract).start(votingParams, callback);"}  <br />
      {"    // custom logic with identifier"} <br />
      {"}"}
    </code></pre>
    <p>The new voting instance can be uniquely identified through the address of the voting contract and its identifier.
      There are now two options of how to proceed:</p>
    <ol>
      <li>Cast votes on the voting contract.</li>
      <li>Cast votes on the calling contract. </li>
    </ol>
    <p>If the voting contract is the place where votes are cast and potentially implemented depending on the developers&#39;
      choice, then there are no more functions that are required for the interface. In that case the calling contract
      needs to somehow make the identifier and voting contract&#39;s address publicly accessible either through a public
      state variable or by reference to an emitted event. The voting contract should ideally emit one, but it&#39;s not
      set in the standard. We maintain one integration with this pattern.</p>
    <p>If the calling contract is the place where votes are cast and potentially implemented depending on the
      developers&#39;choice, then one requires at least a <code>vote</code> function. It allows users not only to call the
      voting contract&#39;s vote function but also to execute custom logic. The <em>status</em> of the voting instance is
      returned and can also be subjected to customized logic on the caller contract. One could for for instance
      immediately implement the outcome of the vote when the returned status is <em>complete</em> or <em>awaitcall</em>.
      In this case it would be helpful to have the value of the callback data stored in cache and trigger an implement
      routine that is either intrinsic to the caller contract or the one on the voting contract, if it exists. The
      instance needs to be uniquely defined throught an <em>identifier</em>, which must be able to disambiguate between
      voting instances from different voting contracts and may thus not be the same as the one issued by the voting
      contract for that instance. The recommended interface is:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function vote(uint256 identifier, bytes calldata votingData) external;
    </code></pre>
    <p>We maintain five integration patterns that use the vote interface. The first one is intended for a snapshot-like
      scenario, where a globally stored voting contract is used (one to rule them all) and the identifier coincides with
      that instance&#39;s identifier on that voting contract. A second and third one call the vote function, but also
      implement the outcome depending on its returned status flag. In one case it&#39;s implemented in the caller, in the
      other it calls the implement function of the voting contract. The fourth and fifth ones only calls vote function and
      instead of implementing the outcome directly, they have separate <code>implement</code> functions that respectively
      implement in the caller or call the voting contract&#39;s implement function:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">function implement(uint256 identifier, bytes calldata callback) external payable;
    </code></pre>
    <p>These five patterns come in a minimal version, which just implements the basic functionality and a swiss-army knife
      version with hooks. Users may come up with their own integration and are encouraged to draw inspiration from these
      integration patterns or mix-n-match. </p>
  </>
)


const VotingIntegrationComp: React.FC<VotingIntegrationArgs> = ({ detailsHandling }: VotingIntegrationArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.VotingContractIntegration]


  /* Display section handling */

  const initialDisplaySection: VotingIntegrationSectionFlags = {
    [VotingIntegrationsSections.VotingContractIntegrationInfo]: true
  }

  const sectionContent: VotingIntegrationSectionContents = {
    [VotingIntegrationsSections.VotingContractIntegrationInfo]: VotingIntegrationElement
  }

  const [displaySection, setDisplaySection] = useState<VotingIntegrationSectionFlags>(initialDisplaySection)

  const setDisplayThisSection = (section: VotingIntegrationsSections, flag: boolean) => {
    let displaySectionTemp = { ...displaySection }
    displaySectionTemp[section] = flag
    setDisplaySection(displaySectionTemp)
  }

  const changeDisplayThisSection = (section: VotingIntegrationsSections) => {
    displaySection[section] ? setDisplayThisSection(section, false) : setDisplayThisSection(section, true);
  }

  /* Rendering the React component */
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
        <p>
          This app exposes an example of a <a href="https://github.com/leomarlo/voting-registry-contracts/tree/development/src/examples/integrations">voting contract integration</a>.<br />
          Any contract which can call voting contracts directly or indirectly (as part of its interface) is called a voting contract integration (Please read the information on voting contract integrations).
        </p>
        {/* <button onClick={() => detailsHandling.detailsSetter(Details)}>Click me</button> */}
      </div>
      <hr />
      {Object.keys(VotingIntegrationsSections).filter((v) => isNaN(Number(v))).map((section) => {
        let sc = VotingIntegrationsSections[section as keyof typeof VotingIntegrationsSections]
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

  )
}

export {
  VotingIntegrationComp
}