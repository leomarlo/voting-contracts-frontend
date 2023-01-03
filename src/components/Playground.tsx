import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import { DetailsHandling, InitialNewInstanceValues, StartNewInstanceArgs } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"
import { VoteOnInstance } from "./VoteOnInstance"
import { StartNewInstance } from "./StartNewInstance"
import {
  FormPrimitive,
  SimpleFormArgs
} from "./forms/SimpleForm"
import {
  getPlaygroundContract,
  getVotingInstanceExternalInfo,
  VotingInstanceInfo,
  getPlaygroundInstancesFromEvents,
  getGeneralVotingInterface,
  InstanceInternalInfo,
  InstanceInternalInfoAndPointer
} from "../utils/web3"

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





enum InstanceStatus {
  Completed = "completed",
  Failed = "failed",
  Active = "active",
  Awaitcall = "await implementation"
}

const getPlaygroundInstancesInternal = async (playground: ethers.Contract) => {
  let instancesFromEvent: Array<InstanceInternalInfo> = await getPlaygroundInstancesFromEvents(playground)
  let instances: Array<InstanceInternalInfoAndPointer> = []
  for (let i = 0; i < instancesFromEvent.length; i++) {
    let inst = await playground.instances(i)
    instances.push({ ...instancesFromEvent[i], identifier: inst.identifier, votingContractAddress: inst.votingContract })
  }
  return instances
}

const getPlaygroundInstances = async (signer: ethers.providers.JsonRpcSigner, chainId: number) => {
  let playground = (await getPlaygroundContract(chainId)).connect(signer)
  // console.log('chainId', chainId, '\nSigner', await signer.getAddress(), '\nPlayground') //, await playground.VOTING_REGISTRY())
  let playgroundInternalInstances = await getPlaygroundInstancesInternal(playground)
  let newInstances: Array<VotingInstanceInfo> = []
  for (let i = 0; i < playgroundInternalInstances.length; i++) {
    let inst: InstanceInternalInfoAndPointer = playgroundInternalInstances[i]
    let newInstance: VotingInstanceInfo = { ...inst, ...await getVotingInstanceExternalInfo(signer, inst.votingContractAddress, await getGeneralVotingInterface(false), inst.identifier) }
    newInstances.push(newInstance)
  }
  return newInstances
}


interface instanceDisplayInfo {
  index: number,
  selected: boolean
}

const setPlaygroundInstances = async (
  chainId: number,
  signer: ethers.providers.JsonRpcSigner,
  setInstances: Dispatch<SetStateAction<Array<VotingInstanceInfo>>>,
  setInstanceDisplayInfo: Dispatch<SetStateAction<Array<instanceDisplayInfo>>>) => {


  let infos = await getPlaygroundInstances(signer, chainId)
  setInstances(infos)
  setInstanceDisplayInfo(infos.map((_, i) => { return { index: i, selected: false } }))
}



const getCurrentVotingInstances = (detailsHandling: DetailsHandling) => {

  const { chainId, library } = useWeb3React<Web3Provider>()

  const [instances, setInstances] = useState<Array<VotingInstanceInfo>>([] as VotingInstanceInfo[])
  const [selectedInstance, setSelectedInstance] = useState<Array<instanceDisplayInfo>>([] as instanceDisplayInfo[])
  const [initialNewInstanceValues, setInitialNewInstanceValues] = useState<InitialNewInstanceValues>({
    targetId: "",
    votingContract: "",
    deadline: ""
  })

  useEffect(() => {
    console.log('instances are', instances)
    if (chainId && library) {
      console.log('chainId inside useEffect (if) is', chainId)
      let signer: ethers.providers.JsonRpcSigner = library.getSigner()

      setPlaygroundInstances(chainId, signer, setInstances, setSelectedInstance)

    } else {
      setInstances([] as VotingInstanceInfo[])
      setSelectedInstance([] as instanceDisplayInfo[])
      console.log('chainId inside useEffect (else) is', chainId)
    }


  }, [chainId, library])

  const updateInstanceInfos = () => {
    // TODO: update information about instances, like time to live, without setting selected instances to none again. 
  }

  const statusColor = {
    [InstanceStatus.Active]: "primary",
    [InstanceStatus.Completed]: "success",
    [InstanceStatus.Failed]: "danger",
    [InstanceStatus.Awaitcall]: "warning"
  }

  const getSelectedInstance = (index?: number) => {
    let instances = [...selectedInstance]
    if (index !== undefined) {
      return instances.map((inst, i) => { return { index: i, selected: i == index } })
    } else {
      return instances.map((inst, i) => { return { index: i, selected: false } })
    }
  }

  const handleInitialInstanceFormChange = (key: string, event: any) => {
    let data = { ...initialNewInstanceValues };
    data[key as keyof typeof data] = event.target.value
    setInitialNewInstanceValues(data)
  }

  const getLocaleFromDeadlineInSeconds = () => {
    let currentTimeInMilliseconds = Math.floor(Date.now())
    if (initialNewInstanceValues.deadline == "") {
      return ""
    } else {
      return (new Date(currentTimeInMilliseconds + initialNewInstanceValues.deadline * 1000)).toLocaleString()
    }
  }
  const ColWidths = {
    hash: "4%",
    targetid: "16%",
    votingContract: "22%",
    deadlineLocale: "22%",
    deadlineInSecs: "12%",
    status: "4%",
    button: "16%"
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col" style={{ minWidth: ColWidths.hash, width: ColWidths.hash, maxWidth: ColWidths.hash }}>#</th>
          <th scope="col" style={{ minWidth: ColWidths.targetid, width: ColWidths.targetid, maxWidth: ColWidths.targetid }}>target function</th>
          <th scope="col" style={{ minWidth: ColWidths.votingContract, width: ColWidths.votingContract, maxWidth: ColWidths.votingContract }}>voting contract</th>
          <th scope="col" style={{ minWidth: ColWidths.deadlineLocale, width: ColWidths.deadlineLocale, maxWidth: ColWidths.deadlineLocale }}>deadline (locale)</th>
          <th scope="col" style={{ minWidth: ColWidths.deadlineInSecs, width: ColWidths.deadlineInSecs, maxWidth: ColWidths.deadlineInSecs }}>deadline (sec. remaining)</th>
          <th scope="col" style={{ minWidth: ColWidths.status, width: ColWidths.status, maxWidth: ColWidths.status }}>status</th>
          <th scope="col" style={{ minWidth: ColWidths.button, width: ColWidths.button, maxWidth: ColWidths.button }}></th>
        </tr>
      </thead>
      <tbody>
        {/* <form style={{ margin: "2px" }}> */}
        <tr style={{ verticalAlign: "middle" }}>
          <th>new</th>
          <td><input
            key="PlaygroundSetInitialTarget"
            type="text"
            value={initialNewInstanceValues.targetId}
            placeholder="function selector"
            onChange={(event) => handleInitialInstanceFormChange("targetId", event)} /></td>
          <td><input
            key="PlaygroundSetInitialVotingContract"
            type="text"
            placeholder="contract address"
            value={initialNewInstanceValues.votingContract}
            onChange={(event) => handleInitialInstanceFormChange("votingContract", event)} /></td>
          <td>{getLocaleFromDeadlineInSeconds()}</td>
          <td><input
            key="PlaygroundSetInitialDeadline"
            type="number"
            placeholder="deadline in seconds"
            value={initialNewInstanceValues.deadline}
            onChange={(event) => handleInitialInstanceFormChange("deadline", event)} /></td>
          <td>0</td>
          <td style={{ textAlign: "right" }}>
            <button
              style={{ minWidth: "90%" }} className="btn btn-success"
              onClick={() => {
                // change selection to nothing-is-selected
                let newInstances = getSelectedInstance()
                setSelectedInstance(newInstances)
                // focus on details
                detailsHandling.focusOnDetailsSetter(true)
                // open new details page

                detailsHandling.detailsSetter(
                  <StartNewInstance
                    detailsHandling={detailsHandling}
                    initialNewInstanceValues={initialNewInstanceValues}
                    initialNewInstanceValuesSetter={setInitialNewInstanceValues} />)
              }}>New Instance</button>
          </td>
        </tr>
        {/* </form> */}
        {instances.map((instance, index) => {
          let status = instance.status ? instance.status : ethers.BigNumber.from("0")
          let statusEnum: InstanceStatus
          if (status == ethers.BigNumber.from("1")) {
            statusEnum = InstanceStatus.Completed
          } else if (status == ethers.BigNumber.from("2")) {
            statusEnum = InstanceStatus.Failed
          } else if (status == ethers.BigNumber.from("4")) {
            statusEnum = InstanceStatus.Awaitcall
          } else {
            statusEnum = InstanceStatus.Active
          }
          return (<tr>
            <th scope="row">{index}</th>
            <td>{(instance.target.isFunction ? instance.target.name : "") + ` (${instance.target.id})`}</td>
            <td>{formatAddress(instance.votingContractAddress)}</td>
            <td>{instance.deadline ? instance.deadline : ""}</td>
            <td>{instance.ttl}</td>
            <td className={"table-" + statusColor[statusEnum]}>{instance.status}</td>
            <td style={{ textAlign: "right" }}>
              <button
                onClick={() => {
                  if (selectedInstance[index].selected) {
                    // change selection to nothing-is-selected
                    let newInstances = getSelectedInstance()
                    setSelectedInstance(newInstances)
                    // close the details window
                    detailsHandling.focusOnDetailsSetter(false)
                    detailsHandling.detailsSetter(<></>)
                    // log some infos
                    console.log('index', index)
                    console.log('newInstances', newInstances[index])
                  } else {
                    // change selection to index-is-selected
                    let newInstances = getSelectedInstance(index)
                    setSelectedInstance(newInstances)
                    // open the details window
                    detailsHandling.focusOnDetailsSetter(true)
                    detailsHandling.detailsSetter(<VoteOnInstance instance={instance} />)
                    // log some infos
                    console.log('index', index)
                    console.log('newInstances', newInstances[index])
                  }

                  console.log('selected instance', selectedInstance)
                }}
                style={{ minWidth: "90%" }} className="btn btn-primary">
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

  const { chainId, library } = useWeb3React<Web3Provider>()

  const [displaySection, setDisplaySection] = useState<SectionFlags>(initialDisplaySection)



  // useEffect(() => {
  //   if (chainId && library) {
  //     getPlaygroundContract(chainId).then(
  //       (contractWithoutSigner) => {
  //         let signer: ethers.providers.JsonRpcSigner | undefined = library.getSigner()
  //         setPlaygroundContract(contractWithoutSigner.connect(signer))
  //       }
  //     )
  //   } else {
  //     setPlaygroundContract({} as ethers.Contract)
  //   }
  //   console.log('We have set the new playground contract')

  // }, [chainId, library])

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