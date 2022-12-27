import React, { CSSProperties, useRef, useState } from "react";
import { FocusOnDetailsVarAndSetter } from "../types/components"
import { PageInfo, Pages, pageInfo, PageSetter } from "../utils/pages"

interface PlaygroundArgs {
  focusOnDetails: FocusOnDetailsVarAndSetter,
  changeSelectedPage: PageSetter
}

const linkStyle: CSSProperties = { color: 'lightcoral', fontWeight: "bold" }

{/* <a href="https://github.com/leomarlo/voting-registry-contracts/tree/development/src/examples/integrations"> */ }

enum Sections {
  WhatIsDaoAbout = "What is this DAO all about?",
  CurrentVotes = "Voting Instances",
  ViewFunctions = "Inspecting the DAO"
}

type SectionFlags = { [section in Sections]: boolean }
type SectionContents = { [section in Sections]: JSX.Element }

const votingInstanceStyle: CSSProperties = {
  minHeight: "200px",
  maxHeight: "200px",
  minWidth: "200px",
  maxWidth: "200px",
  display: "inline-block"
}

const getCurrentVotingInstances = () => {
  const instanceExamples = [
    { address: "0x1234", target: "function(xyz)", deadline: "12:34  12-08-1987" },
    { address: "0x2345", target: "function(abc)", deadline: "12:34  12-08-1987" },
    { address: "0x3456", target: "function(djdjdj)", deadline: "12:34  12-08-1987" },
    { address: "0x4567", target: "function(ss,ss,dd)", deadline: "12:34  12-08-1987" },
    { address: "0x5678", target: "function(huups)", deadline: "12:34  12-08-1987" },
    { address: "0x6789", target: "function(blabla)", deadline: "12:34  12-08-1987" },
    { address: "0x6009", target: "function(blubb)", deadline: "12:34  12-08-1987" }
  ]
  return (
    <>
      {instanceExamples.map((instance) => {
        return (
          < div style={votingInstanceStyle} className="card">
            {instance.address}<br />
            {instance.target}<br />
            {instance.deadline}</div>)
      })}
    </>)

}


const PlaygroundComp: React.FC<PlaygroundArgs> = ({ focusOnDetails, changeSelectedPage }: PlaygroundArgs) => {

  const initialDisplaySection: SectionFlags = {
    [Sections.WhatIsDaoAbout]: true,
    [Sections.CurrentVotes]: false,
    [Sections.ViewFunctions]: false
  }

  const [displaySection, setDisplaySection] = useState<SectionFlags>(initialDisplaySection)
  const changeCounter = useRef<string>("change")

  const setDisplayThisSection = (section: Sections, flag: boolean) => {
    let displaySectionTemp = { ...displaySection }
    displaySectionTemp[section] = flag
    setDisplaySection(displaySectionTemp)
  }

  const changeDisplayThisSection = (section: Sections) => {
    displaySection[section] ? setDisplayThisSection(section, false) : setDisplayThisSection(section, true);
  }


  const sectionContent: SectionContents = {
    [Sections.WhatIsDaoAbout]: (
      <>
        <p>
          At its heart the DAO has a <span style={linkStyle}>counter</span> variable that may be tampered with.
          The counter can be change via the function <span onClick={() => { }} style={linkStyle}>changeCounter(uint256 by)</span>.
          Initially this changes the counter by the addition of an amount 'by'. However, also the arithmetic operation that changes the counter is modifiable.
          It can be set either to addition, subtraction, division, modulo or exponentiation via the function <span style={linkStyle}>changeOperation(Operation newOperation)</span>.
          {/* 
          Functions that can be triggered by anyone (1) are all the view functions and the addition of a new voting contract into the DAO's storage.
          Naturally, one may also deposit the native currency into the contract. This triggers the receive() function and the deposit gets recorded in the contract. */}

        </p>
      </>
    ),
    [Sections.CurrentVotes]: getCurrentVotingInstances(),
    [Sections.ViewFunctions]: (
      <div key="hallo" className="card">
        <div className="card-body"> Functions </div>
      </div>
    )
  }

  const Paragraphs = Object.keys(Sections).map((section) => {
    let sc = Sections[section as keyof typeof Sections]
    return (
      <>
        <hr />
        <h5
          style={{ cursor: "pointer" }}
          onClick={() => changeDisplayThisSection(sc)}>
          {(displaySection[sc] ? '⯆ ' : '⯈ ') + sc}
        </h5>
        {displaySection[sc] ? <div style={{ paddingLeft: "30px" }}>{sectionContent[sc]}</div> : <></>}

      </>
    )
  })

  let thisPageInfo: PageInfo = pageInfo[Pages.VotingPlayground]
  return (
    <div key={thisPageInfo.key}>
      <h3>{thisPageInfo.title}</h3>
      <p>
        This app exposes an example of a
        voting contract integration.
        Any contract that may call voting contracts directly (as part of its interface) or indirectly (as part of a private or internal function) is a voting contract integration.
        <span style={{ marginLeft: "3px", ...linkStyle }} onClick={(e) => { changeSelectedPage(Pages.VotingContractIntegration) }}>
          Please read detailed information here!
        </span><br /><br />

        We have created a hypothetical DAO with several functions, that can be triggered:
        <ol>
          <li> by anyone,</li>
          <li> only through a vote,</li>
          <li> by some with rights or through a vote.</li>
        </ol>
      </p>
      {Paragraphs}
    </div>
  )
}

export {
  PlaygroundComp
}