import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"
import { getPlaygroundContract } from "../utils/web3"
import { formatAddress } from '../utils/format'
import { ethers } from 'ethers'

interface PlaygroundArgs {
  detailsHandling: DetailsHandling
}
const linkStyle: CSSProperties = { color: 'lightcoral', fontWeight: "bold" }

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

const contentStyle: CSSProperties = {
  overflowY: "scroll",
  minHeight: "100%",
  height: "100%",
  maxHeight: "100%",
  padding: "35px",
  // backgroundColor: "yellow",
  margin: "0px"
}

interface VoteOnInstanceArgs {
  index: number
}

const VoteOnInstance: React.FC<VoteOnInstanceArgs> = ({ index }: VoteOnInstanceArgs) => {
  return (
    <div>
      {"Voting Instance number " + index.toString()}
    </div>
  )
}

enum InstanceStatus {
  Active = "active",
  Inactive = "inactive",
  Implement = "implement"
}

const getPlaygroundInstances = async (chainId: number, signer: ethers.providers.JsonRpcSigner) => {
  let playground = (await getPlaygroundContract(chainId)).connect(signer)
  let instances = []
  let exceedsLength = false
  let i = 0
  while (!exceedsLength) {
    try {
      let inst = await playground.instances(i)
      instances.push(inst)
      i += 1
    }
    catch (err) {
      exceedsLength = true
    }
  }
  return instances
}

interface instanceInfoOnChain {
  identifier: ethers.BigNumber,
  votingContract: string,
  status: InstanceStatus
}

interface instanceDisplayInfo {
  index: number,
  selected: boolean
}



const setPlaygroundInstances = async (
  chainId: number,
  signer: ethers.providers.JsonRpcSigner,
  setInstance: Dispatch<SetStateAction<Array<instanceInfoOnChain>>>,
  setInstanceInfo: Dispatch<SetStateAction<Array<instanceDisplayInfo>>>) => {

  let infos = await getPlaygroundInstances(chainId, signer)
  setInstance(infos.map((inst) => { return { identifier: inst.identifier, votingContract: inst.votingContract, status: InstanceStatus.Active } }))
  setInstanceInfo(infos.map((_, i) => { return { index: i, selected: false } }))
}

const getCurrentVotingInstances = (detailsHandling: DetailsHandling) => {

  const { account, chainId, library } = useWeb3React<Web3Provider>()

  const [instances, setInstances] = useState([] as instanceInfoOnChain[])
  const [selectedInstance, setSelectedInstance] = useState([] as instanceDisplayInfo[])

  // TODO: remove

  useEffect(() => {
    if (chainId && library) {
      setPlaygroundInstances(chainId, library.getSigner(), setInstances, setSelectedInstance)
    }
    console.log('We are in use effects')
  }, [chainId]);





  const statusColor = {
    [InstanceStatus.Active]: "success",
    [InstanceStatus.Inactive]: "secondary",
    [InstanceStatus.Implement]: "danger"
  }

  const getSelectedInstance = (index?: number) => {
    let instances = [...selectedInstance]
    if (index !== undefined) {
      return instances.map((inst, i) => { return { index: i, selected: i == index } })
    } else {
      return instances.map((inst, i) => { return { index: i, selected: false } })
    }
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">target function</th>
          <th scope="col">voting contract</th>
          <th scope="col">time remaining</th>
          <th scope="col" style={{ width: "8.33%" }}>status</th>
          <th scope="col" style={{ width: "16.66%" }}></th>
        </tr>
      </thead>
      <tbody>
        {instances.map((instance, index) => {
          return (<tr>
            <th scope="row">{index}</th>
            <td>{instance.identifier.toString()}</td>
            <td>{formatAddress(instance.votingContract)}</td>
            <td>{formatAddress(instance.votingContract)}</td>
            <td className={"table-" + statusColor[instance.status]}>{instance.status}</td>
            <td style={{ textAlign: "right" }}>
              <button
                onClick={() => {
                  if (selectedInstance[index].selected) {
                    let newInstances = getSelectedInstance()
                    setSelectedInstance(newInstances)
                    detailsHandling.focusOnDetailsSetter(false)
                    detailsHandling.detailsSetter(<></>)
                    console.log('index', index)
                    console.log('newInstances', newInstances[index])
                  } else {
                    let newInstances = getSelectedInstance(index)
                    setSelectedInstance(newInstances)
                    detailsHandling.focusOnDetailsSetter(true)
                    detailsHandling.detailsSetter(<VoteOnInstance index={index} />)
                    console.log('index', index)
                    console.log('newInstances', newInstances[index])
                  }

                  console.log('selected instance', selectedInstance)
                }}
                style={{ minWidth: "90%" }} className="btn btn-success">
                {selectedInstance[index].selected ? "Hide" : "Open Instance"}
              </button></td>
          </tr>)
        })}
      </tbody>
    </table>)
}



const PlaygroundComp: React.FC<PlaygroundArgs> = ({ detailsHandling }: PlaygroundArgs) => {

  const initialDisplaySection: SectionFlags = {
    [Sections.WhatIsDaoAbout]: true,
    [Sections.CurrentVotes]: true,
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
    [Sections.CurrentVotes]: getCurrentVotingInstances(detailsHandling),
    [Sections.ViewFunctions]: (
      <div key="hallo" className="card">
        <div className="card-body"> Functions </div>
      </div>
    )
  }

  const Paragraphs = Object.keys(Sections).filter((v) => isNaN(Number(v))).map((section) => {
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
    <div key={thisPageInfo.key} style={contentStyle}>
      <h3>{thisPageInfo.title}</h3>
      <p>
        This app exposes an example of a
        voting contract integration.
        Any contract that may call voting contracts directly (as part of its interface) or indirectly (as part of a private or internal function) is a voting contract integration.
        <span style={{ marginLeft: "3px", ...linkStyle }} onClick={(e) => { detailsHandling.pageSetter(Pages.VotingContractIntegration) }}>
          Please read detailed information here!
        </span><br /><br />

        We have created a hypothetical DAO with several functions, each of which can either be triggered:
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