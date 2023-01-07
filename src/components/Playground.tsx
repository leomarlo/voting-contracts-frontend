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

import Select, { MultiValue } from 'react-select'
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

const getPlaygroundInstances = async (signer: ethers.providers.JsonRpcSigner, playground: ethers.Contract) => {
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

enum VotingStatusImplement {
  completed = "Completed",
  failed = "Failed",
  active = "Active",
  awaitcall = "Awaitcall",
  custom = "Custom"
}

const votingSTatusIndex: { [status in VotingStatusImplement]: number } = {
  [VotingStatusImplement.completed]: 1,
  [VotingStatusImplement.failed]: 2,
  [VotingStatusImplement.active]: 3,
  [VotingStatusImplement.awaitcall]: 4,
  [VotingStatusImplement.custom]: 5,
}


interface instanceDisplayInfo {
  index: number,
  selected: boolean
}

const setPlaygroundInstances = async (
  chainId: number,
  signer: ethers.providers.JsonRpcSigner,
  setInstances: Dispatch<SetStateAction<Array<VotingInstanceInfo>>>,
  setInstanceDisplayInfo: Dispatch<SetStateAction<Array<instanceDisplayInfo>>>,
  setPlayground: Dispatch<SetStateAction<ethers.Contract>>,
  setDisplayedInstances: Dispatch<SetStateAction<Array<number>>>) => {

  let playgroundContract = (await getPlaygroundContract(chainId)).connect(signer)
  let infos = await getPlaygroundInstances(signer, playgroundContract)
  setInstances(infos)
  setInstanceDisplayInfo(infos.map((_, i) => { return { index: i, selected: false } }))
  setPlayground(playgroundContract)
  setDisplayedInstances(infos.map((_, i) => i))
}



const getCurrentVotingInstances = (detailsHandling: DetailsHandling) => {

  const { chainId, library } = useWeb3React<Web3Provider>()
  const [playground, setPlayground] = useState<ethers.Contract>(new ethers.Contract(ethers.constants.AddressZero, []))
  const [instances, setInstances] = useState<Array<VotingInstanceInfo>>([] as VotingInstanceInfo[])
  const [displayedInstances, setDisplayedInstances] = useState<Array<number>>([])
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
      setPlaygroundInstances(chainId, signer, setInstances, setSelectedInstance, setPlayground, setDisplayedInstances)

    } else {
      setInstances([] as VotingInstanceInfo[])
      setDisplayedInstances([] as number[])
      setSelectedInstance([] as instanceDisplayInfo[])
      setPlayground(new ethers.Contract(ethers.constants.AddressZero, []))
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
    targetid: "20%",
    votingContract: "22%",
    deadlineLocale: "22%",
    deadlineInSecs: "12%",
    status: "4%",
    button: "16%"
  }
  const hashColStyle = { minWidth: ColWidths.hash, width: ColWidths.hash, maxWidth: ColWidths.hash }
  const targetColStyle = { minWidth: ColWidths.targetid, width: ColWidths.targetid, maxWidth: ColWidths.targetid }
  const votingContractColStyle = { minWidth: ColWidths.votingContract, width: ColWidths.votingContract, maxWidth: ColWidths.votingContract }
  const deadlineColStyle = { minWidth: ColWidths.deadlineLocale, width: ColWidths.deadlineLocale, maxWidth: ColWidths.deadlineLocale }
  const deadlineInSecsColStyle = { minWidth: ColWidths.deadlineInSecs, width: ColWidths.deadlineInSecs, maxWidth: ColWidths.deadlineInSecs }
  const statusColStyle = { minWidth: ColWidths.status, width: ColWidths.status, maxWidth: ColWidths.status }
  const buttonColStyle = { minWidth: ColWidths.button, width: ColWidths.button, maxWidth: ColWidths.button }

  const options = Object.keys(VotingStatusImplement).map((k) => { return { value: k, label: VotingStatusImplement[k as keyof typeof VotingStatusImplement] } })

  const handleDisplayedInstanceChange = (
    event: MultiValue<{
      value: string
      label: VotingStatusImplement
    }>,
    typeOfFilterChange?: string) => {

    console.log(event)
    if (typeOfFilterChange == "status") {
      // let selectedStatusIndices = event.map(({ value, label }) => { return votingSTatusIndex[value as keyof typeof votingSTatusIndex].toString() })
      if (event.length > 0) {
        console.log(event[0].value, event[0].label)

      }
      let selectedStatusIndices = ["3"]
      let instanceIds: Array<number> = []
      for (let j = 0; j < instances.length; j++) {
        let info = instances[j]
        if (info.status ? selectedStatusIndices.includes(info.status) : false) {
          instanceIds.push(info.index)
        }
      }

      setDisplayedInstances(instanceIds)

    }

  }

  return (
    <div>
      <div>
        <div style={{ display: "inline-block", width: "30%" }}>

          <Select
            onChange={(event) => handleDisplayedInstanceChange(event, "status")}
            isMulti
            placeholder="Filter Status"
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
          ></Select>
        </div>
      </div>
      <div style={{}}>
        <table style={{ verticalAlign: "middle", tableLayout: "fixed" }} className="table">
          <thead>
            <tr>
              <th scope="col" style={hashColStyle}>#</th>
              <th scope="col" style={targetColStyle}>target function</th>
              <th scope="col" style={votingContractColStyle}>voting contract</th>
              <th scope="col" style={deadlineColStyle}>deadline (locale)</th>
              <th scope="col" style={deadlineInSecsColStyle}>deadline (sec. remaining)</th>
              <th scope="col" style={statusColStyle}>status</th>
              <th scope="col" style={buttonColStyle}></th>
            </tr>
          </thead>
          <tbody>
            {/* <form style={{ margin: "2px" }}> */}
            <tr style={{ verticalAlign: "middle" }}>
              <th>new</th>
              <td ><input
                style={{ marginRight: "6px", width: "90%" }}
                key="PlaygroundSetInitialTarget"
                type="text"
                value={initialNewInstanceValues.targetId}
                placeholder="function selector"
                onChange={(event) => handleInitialInstanceFormChange("targetId", event)} /></td>
              <td><input
                style={{ marginRight: "6px", width: "90%" }}
                key="PlaygroundSetInitialVotingContract"
                type="text"
                placeholder="contract address"
                value={initialNewInstanceValues.votingContract}
                onChange={(event) => handleInitialInstanceFormChange("votingContract", event)} /></td>
              <td>{getLocaleFromDeadlineInSeconds()}</td>
              <td><input
                style={{ marginRight: "6px", width: "90%" }}
                key="PlaygroundSetInitialDeadline"
                type="number"
                placeholder="deadline in seconds"
                value={initialNewInstanceValues.deadline}
                onChange={(event) => handleInitialInstanceFormChange("deadline", event)} /></td>
              <td>0</td>
              <td style={{ textAlign: "right" }}>
                <button
                  disabled={chainId === undefined}
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
            {displayedInstances.map((displayedIndex) => {
              let instance = instances[displayedIndex]
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
                <th scope="row">{displayedIndex}</th>
                <td>{(instance.target.isFunction ? instance.target.name : "") + ` (${instance.target.id})`}</td>
                <td>{formatAddress(instance.votingContractAddress, 7)}</td>
                <td>{instance.deadline ? instance.deadline : ""}</td>
                <td>{instance.ttl}</td>
                <td className={"table-" + statusColor[statusEnum]}>{instance.status}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    onClick={() => {
                      if (selectedInstance[displayedIndex].selected) {
                        // change selection to nothing-is-selected
                        let newInstances = getSelectedInstance()
                        setSelectedInstance(newInstances)
                        // close the details window
                        detailsHandling.focusOnDetailsSetter(false)
                        detailsHandling.detailsSetter(<></>)
                        // log some infos
                        console.log('index', displayedIndex)
                        console.log('newInstances', newInstances[displayedIndex])
                      } else {
                        // change selection to index-is-selected
                        let newInstances = getSelectedInstance(displayedIndex)
                        setSelectedInstance(newInstances)
                        // open the details window
                        detailsHandling.focusOnDetailsSetter(true)
                        detailsHandling.detailsSetter(<VoteOnInstance playground={playground} instance={instance} />)
                        // log some infos
                        console.log('index', displayedIndex)
                        console.log('newInstances', newInstances[displayedIndex])
                      }

                      console.log('selected instance', selectedInstance)
                    }}
                    style={{ minWidth: "90%" }} className="btn btn-primary">
                    {selectedInstance[displayedIndex].selected ? "Hide" : "Open Instance"}
                  </button></td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>)
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