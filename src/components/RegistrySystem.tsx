import React, { useState } from "react";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"


enum RegistrySystemSections {
  Registry = "Registry",
  Registrar = "Registrar",
  Resolver = "Resolver",
}

type RegistrySystemSectionsSectionFlags = { [section in RegistrySystemSections]: boolean }
type RegistrySystemSectionsSectionContents = { [section in RegistrySystemSections]: JSX.Element }


interface RegistrySystemArgs {
  detailsHandling: DetailsHandling
}


const RegistrySystemRegistryElement: JSX.Element = (
  <>
    <p>The voting registry is a place where voting contracts <code>MAY</code> register their voting implementation, if they
      satisfy the <code>voting contract interface</code>. We propose that registration consists of only two steps:</p>
    <ol>
      <li>Check the interface of the voting contract that seeks registration.</li>
      <li>Create an entry in the registry. </li>
    </ol>
    <p>In order to check the interface, we suggest that the voting contract needs to implement the ERC165 standard with a
      function <code>supportsInterface</code>. The voting contract must have completed deployment before registration can
      take place. If the registration were to be called during the construction of the contract, the registry would not be
      able to call any external functions and therefore couldn&#39;t complete the registration. The function that checks
      the interface would look like this:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"bytes4 constant VOTING_CONTRACT_STANDARD_INTERFACE = 0x12345678;"} <br />
      {""} <br />
      {"function checkInterface(address contractAddress) internal returns(bool) {"} <br />
      {"    return IERC165(contractAddress).supportsInterface(VOTING_CONTRACT_STANDARD_INTERFACE);"} <br />
      {"}"} <br />
    </code></pre>
    <p>An entry in the registry consists of a mapping from the voting contract address (<code>contractAddress</code>) to a
      tuple containing the address of the registrar that may also be an externally owned account (<code>registrar</code>)
      and the address of a resolver contract that resolves any metadata (<code>resolver</code>). Setting the resolver is
      optional. We propose to store this with a struct data type and a mapping:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"struct Record {"} <br />
      {"    address registrar,"} <br />
      {"    address resolver"} <br />
      {"}"} <br />
      {""} <br />
      {"mapping(address=>Record) records; "} <br />
    </code></pre>
    <p>The registration would then be as simple as calling the <code>register</code> function which triggers a
      <code>Registered</code> event:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"event Registered(address contractAddress, address registrar, address resolver);"} <br />
      {""} <br />
      {"function register("} <br />
      {"    address contractAddress,"} <br />
      {"    address resolver"} <br />
      {")"} <br />
      {"external"} <br />
      {"returns(bytes32 votingContractId) "} <br />
      {"{"} <br />
      {"    require(records[contractAddress].registrar == address(0));"} <br />
      {"    require(checkInterface(contractAddress));"} <br />
      {"    records[contractAddress] = Record({"} <br />
      {"        registrar: msg.sender,"} <br />
      {"        resolver: resolver"} <br />
      {"    });"} <br />
      {"    emit Registered(contractAddress, msg.sender, resolver);"} <br />
      {"}"}
    </code></pre>
    <p>The registrar is somewhat like an owner of the record. So we propose to allow for the resolver to be changed by the
      registrar:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"ResolverUpdated(address contractAddress, address newResolver);"} <br />
      {""} <br />
      {"function changeResolver("} <br />
      {"    address contractAddress,"} <br />
      {"    address resolver "} <br />
      {")"} <br />
      {"external"} <br />
      {"{"} <br />
      {"    require(msg.sender == records[contractAddress].registrar);"} <br />
      {"    records[contractAddress].resolver = resolver;"} <br />
      {"    emit ResolverUpdated(contractAddress, resolver);"} <br />
      {"}"} <br />
    </code></pre>
  </>
)

const RegistrySystemRegistrarElement: JSX.Element = (
  <>
    <p>The registrar is the msg.sender for the registration. Although an externally owned account could perfectly register a
      new voting contract, there are many advantages of having a contract doing the job. The main ones being visibility,
      reliability, governance and maintenance.</p>
    <p>The core function of the registrar is obviously to register on the registry:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"address constant REGISTRY = 0x0123456789012345678901234567890123456789;"} <br />
      {""} <br />
      {"function _register(address votingContract, address resolver) internal {"} <br />
      {"    IRegistry(REGISTRY).register(votingContract, resolver);"} <br />
      {"}"}
    </code></pre>
    <p>The rights to that registry record may conferred to a controller, who may transfer the rights if desired. The
      registrar is then simply the executer of any logic regarding the records. One convenient way to handle the issuance
      of controller rights as well as their transferral would be through an implementation of a <code>ERC721</code>
      interface. However, other implementations are equally possible. </p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function _setController(address votingContract, address controller) internal {"} <br />
      {"    uint256 tokenId = uint256(uint160(votingContract));"} <br />
      {"    ERC721._mint(controller, tokenId);"} <br />
      {"}"} <br />
      {""} <br />
      {"function getController(address votingContract) public view returns(address controller) {"} <br />
      {"    uint256 tokenId = uint256(uint160(votingContract));"} <br />
      {"    controller = ERC721.ownerOf(tokenId);"} <br />
      {"}"}
    </code></pre>
    <p>The registration would then not only register the voting contract to the registry, but also confer rights to a
      designated controller:</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function register(address votingContract, address resolver, address controller) external {"} <br />
      {"    _register(votingContract, resolver);"} <br />
      {"    _setController(votingContract, controller);"} <br />
      {"}"}
    </code></pre>
    <p>The registrar contract <code>MAY</code> also have an interface for the owner to set a new resolver. </p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function changeResolver(address votingContract, address newResolver) external {"} <br />
      {"    require(msg.sender == _getController(votingContract));"} <br />
      {"    IRegistry(REGISTRY).changeResolver(votingContract, newResolver);"} <br />
      {"}"}
    </code></pre>
  </>
)

const RegistrySystemResolverElement: JSX.Element = (
  <>
    <p>The resolver is any contract that adds metadata to the registered record. The following list provides suggestions
      regarding the information that <code>MAY</code> be recorded:</p>
    <ol>
      <li>Are new voting instances created directly through the voting contract?</li>
      <li>Does the voting contract have an <code>implement</code> external function?</li>
      <li>Is the voting contract an upgradable proxy contract?</li>
      <li>What kind of voting methods are available?</li>
      <li>How often has the voting instance been created?</li>
    </ol>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"mapping(address=>bool) public requiredDirectCall;"} <br />
      {"mapping(address=>bool) public isImplementer;"} <br />
      {"mapping(address=>bool) public isProxy;"} <br />
      {"mapping(address=>bytes32[]) public methods;"} <br />
      {"mapping(address=>uint256) public usage;"} <br />
    </code></pre>
    <p>
      One may append this set of mappings and also add reverse lookups to obtain the implementers of a certain
      voting method with the highest usage etc. The mappings can of course be combined into one mapping to a
      struct. One should also implement setters and if the values ought to be accessible from other contracts one
      should implement getters, too.</p>
    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"function _setIsImplementer(address votingContract, bool _isImplementer) internal {"} <br />
      {"    isImplementer[votingContract] = _isImplementer;"} <br />
      {"}"} <br />
      {""} <br />
      {"function getIsImplementer(address votingContract) external view returns(bool) {"} <br />
      {"    return isImplementer[votingContract];"} <br />
      {"}"}
    </code></pre>
    Resolvers could be administrated by the token-holders of the registrar. To achieve that the resolver needs to know about the registrar. It might have some modifiers in place to allow only tokenholders to make changes to the metadata, depending on the type of metadata of course.

    <pre style={{ paddingLeft: "30px" }}><code className="lang-js">
      {"IRegistrar registrar; "} <br />
      {""} <br />
      {"function setIsImplementer(address votingContract, bool _isImplementer) external {"} <br />
      {"    require(registrar.getController(votingContract) == msg.sender);"} <br />
      {"    _setIsImplementer(votingContract, _isImplementer)"} <br />
      {"}"}
    </code></pre>
    <p>Certain information ought to stay unaltered and others could be changed only by a community vote. One might for
      instance allow only the community of token holders to change a certain value. The information of whether the voting
      contract is a proxy contract is important for users to decide whether they trust it. Setting that value by the
      entire community increases trust.</p>
  </>
)


const RegistrySystemComp: React.FC<RegistrySystemArgs> = ({ detailsHandling }: RegistrySystemArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.VotingRegistrySystem]


  /* Display section handling */

  const initialDisplaySection: RegistrySystemSectionsSectionFlags = {
    [RegistrySystemSections.Registry]: false,
    [RegistrySystemSections.Registrar]: false,
    [RegistrySystemSections.Resolver]: false
  }

  const sectionContent: RegistrySystemSectionsSectionContents = {
    [RegistrySystemSections.Registry]: RegistrySystemRegistryElement,
    [RegistrySystemSections.Registrar]: RegistrySystemRegistrarElement,
    [RegistrySystemSections.Resolver]: RegistrySystemResolverElement
  }

  const [displaySection, setDisplaySection] = useState<RegistrySystemSectionsSectionFlags>(initialDisplaySection)

  const setDisplayThisSection = (section: RegistrySystemSections, flag: boolean) => {
    let displaySectionTemp = { ...displaySection }
    displaySectionTemp[section] = flag
    setDisplaySection(displaySectionTemp)
  }

  const changeDisplayThisSection = (section: RegistrySystemSections) => {
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
        <p>The voting registry contract system consists of three components. In its design it is a stripped down version of the
          ENS system:</p>
        <ol>
          <li>registry</li>
          <li>registrar</li>
          <li>
            <p>resolver</p>
            <p>The registry stores all the records of voting implementations and a pointer to the metadata. This pointer is
              the address of a resolver contract and the metadata is stored in that resolver contract allowing for more
              flexibility regarding the structure of the metadata and its mutability. The registrar handles the
              registration. </p>
          </li>
        </ol>
        <hr />
        {Object.keys(RegistrySystemSections).filter((v) => isNaN(Number(v))).map((section) => {
          let sc = RegistrySystemSections[section as keyof typeof RegistrySystemSections]
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
  RegistrySystemComp
}