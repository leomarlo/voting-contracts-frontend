import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import {
  DetailsHandling,
  InitialNewInstanceValues,
  RegisteredContractsEventArgs,
  RegisteredVotingContract,
  StartNewInstanceArgs,
} from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"
import { VoteOnInstance } from "./VoteOnInstance"
import { StartNewInstance } from "./StartNewInstance"

import Select, { MultiValue } from 'react-select'
import {
  getPlaygroundContract,
  getPlaygroundInterface,
  getVotingInstanceExternalInfo,
  VotingInstanceExternalInfo,
  VotingInstanceInfo,
  getPlaygroundInstancesFromEvents,
  getGeneralVotingInterface,
  getVotingRegistryInterface,
  InstanceInternalInfo,
  InstanceInternalInfoAndPointer,
  getRegisteredVotingContracts
} from "../utils/web3"

import { formatAddress, ellipseString } from '../utils/format'
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
    instances.push({
      internal: instancesFromEvent[i],
      pointer: {
        identifier: inst.identifier,
        votingContractAddress: inst.votingContract
      }
    })
  }
  return instances
}

const getPlaygroundInstances = async (signer: ethers.providers.JsonRpcSigner, playground: ethers.Contract) => {
  // console.log('chainId', chainId, '\nSigner', await signer.getAddress(), '\nPlayground') //, await playground.VOTING_REGISTRY())
  let playgroundInternalInstances: Array<InstanceInternalInfoAndPointer> = await getPlaygroundInstancesInternal(playground)
  let newInstances: Array<VotingInstanceInfo> = []
  const generalVotingInterface = await getGeneralVotingInterface(false)
  const externalInfos = await Promise.all(playgroundInternalInstances.map((inst, i) => {
    return getVotingInstanceExternalInfo(signer, inst.pointer.votingContractAddress, generalVotingInterface, inst.pointer.identifier)
  }))
  for (let i = 0; i < playgroundInternalInstances.length; i++) {
    let inst: InstanceInternalInfoAndPointer = playgroundInternalInstances[i]
    let newInstance: VotingInstanceInfo = {
      ...inst,
      external: externalInfos[i],
      chainInfo: {
        successfulAttempt: false,
        successfulImplement: false,
        attempts: 0
      }
    }
    newInstances.push(newInstance)
  }
  return newInstances
}

enum VotingStatusImplement {
  completed = "Completed",
  failed = "Failed",
  active = "Active",
  awaitcall = "Awaitcall",
  custom = "Custom (>4)"
}

const votingStatusIndex: { [status in VotingStatusImplement]: number } = {
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

const parseDate = /(\d{1})\/(\d{2})\/(\d{3}),/

const setPlaygroundInstances = async (
  chainId: number,
  signer: ethers.providers.JsonRpcSigner,
  setInstances: Dispatch<SetStateAction<Array<VotingInstanceInfo>>>,
  setInstanceDisplayInfo: Dispatch<SetStateAction<Array<instanceDisplayInfo>>>,
  setPlayground: Dispatch<SetStateAction<ethers.Contract>>,
  setDisplayedInstances: Dispatch<SetStateAction<Array<number>>>,
  setRegisteredVotingContracts: Dispatch<Array<RegisteredVotingContract>>,
  setRegistry: Dispatch<SetStateAction<ethers.Contract>>) => {


  let playgroundContract = (await getPlaygroundContract(chainId)).connect(signer)
  let infos = await getPlaygroundInstances(signer, playgroundContract)
  setInstances(infos)
  setInstanceDisplayInfo(infos.map((_, i) => { return { index: i, selected: false } }))
  setPlayground(playgroundContract)
  let dates = infos.map(i => {
    if (i.external.deadline) {
      return new Date(i.external.deadline.replace(parseDate, '$1-$2-$3'))
    } else {
      return new Date()
    }
  })
  let indexedDates = infos.map(function (e, i) {
    return {
      ind: i,
      val: (e.external.deadline) ? new Date(e.external.deadline.replace(parseDate, '$1-$2-$3')) : new Date()
    }
  });
  // sort index/value couples, based on values
  indexedDates.sort((x, y) => { return x.val < y.val ? 1 : x.val == y.val ? 0 : -1 });
  // make list keeping only indices
  let indices = indexedDates.map((e) => { return e.ind });
  console.log('DAATTA', indices)
  // infos[0].external.deadline
  // setDisplayedInstances(infos.map((_, i) => i))
  setDisplayedInstances(indices)
  let votingRegistryInterface = await getVotingRegistryInterface(false)
  let _registry = new ethers.Contract(await playgroundContract.VOTING_REGISTRY(), votingRegistryInterface, signer)
  setRegistry(_registry)
  let registeredVotingContracts: Array<RegisteredContractsEventArgs> = await getRegisteredVotingContracts(_registry)
  console.log(registeredVotingContracts)
  setRegisteredVotingContracts(registeredVotingContracts.map((evtargs) => {
    let entry: RegisteredVotingContract = {
      registrationArgs: evtargs,
      instantiation: {
        disabledForTheChosenSelector: false
      },
      callTimes: 0
    }
    return entry
  }))

}



const getCurrentVotingInstances = (detailsHandling: DetailsHandling) => {


  const { chainId, library } = useWeb3React<Web3Provider>()
  const [playground, setPlayground] = useState<ethers.Contract>(new ethers.Contract(ethers.constants.AddressZero, []))
  const [registry, setRegistry] = useState<ethers.Contract>(new ethers.Contract(ethers.constants.AddressZero, []))
  const [registeredVotingContracts, setRegisteredVotingContracts] = useState<Array<RegisteredVotingContract>>([])
  const [instances, setInstances] = useState<Array<VotingInstanceInfo>>([] as VotingInstanceInfo[])
  const [displayedInstances, setDisplayedInstances] = useState<Array<number>>([])
  const [selectedInstance, setSelectedInstance] = useState<Array<instanceDisplayInfo>>([] as instanceDisplayInfo[])
  const [initialNewInstanceValues, setInitialNewInstanceValues] = useState<InitialNewInstanceValues>({
    targetId: "",
    votingContract: "",
    deadline: ""
  })


  useEffect(() => {
    if (chainId && library) {
      let signer: ethers.providers.JsonRpcSigner = library.getSigner()
      setPlaygroundInstances(
        chainId,
        signer,
        setInstances,
        setSelectedInstance,
        setPlayground,
        setDisplayedInstances,
        setRegisteredVotingContracts,
        setRegistry)
      // setRegisteredVotingContracts()
      // TODO: getRegisteredVotingContracts
    } else {
      setInstances([] as VotingInstanceInfo[])
      setDisplayedInstances([] as number[])
      setSelectedInstance([] as instanceDisplayInfo[])
      setPlayground(new ethers.Contract(ethers.constants.AddressZero, []))
      setRegisteredVotingContracts([])
      setRegistry(new ethers.Contract(ethers.constants.AddressZero, []))
    }


  }, [chainId, library])

  const updateInstanceInfos = async (
    index: ethers.BigNumber,
    property: string | undefined,
    transactionHashAndAttempts?: {
      transactionHash?: string,
      successfulAttempt: boolean,
      successfulImplement: boolean,
      attempts: number
    }) => {
    if (library === undefined) return null
    let tempInstances = [...instances]

    console.log(`We are updating the instance info of instance ${index} and the property is ${property}.`)
    // TODO: update information about instances, like time to live, without setting selected instances to none again. 
    for (let i = 0; i < tempInstances.length; i++) {
      if (tempInstances[i].internal.index == index) {
        if (property == "all") {
          let signer: ethers.providers.JsonRpcSigner = library.getSigner()
          let externalInfo: VotingInstanceExternalInfo = await getVotingInstanceExternalInfo(signer, tempInstances[i].pointer.votingContractAddress, await getGeneralVotingInterface(false), tempInstances[i].pointer.identifier)
          tempInstances[i].external = externalInfo
        } else if (property == "implementingPermitted") {
          try {
            let implementingPermitted = await tempInstances[i].external.votingContract.implementingPermitted(tempInstances[i].external.identifier)
            tempInstances[i].external.implementingPermitted = implementingPermitted
          } catch (err) {
          }
        } else if (property == "transactionHash" && transactionHashAndAttempts) {
          console.log('WE ARE IN THE CRUCIAL FUNCTION ', transactionHashAndAttempts)
          if (transactionHashAndAttempts.transactionHash) {
            console.log('We are in transaction hash')
            tempInstances[i].chainInfo = {
              hash: transactionHashAndAttempts.transactionHash,
              successfulAttempt: transactionHashAndAttempts.successfulAttempt,
              successfulImplement: transactionHashAndAttempts.successfulImplement,
              attempts: transactionHashAndAttempts.attempts
            }
          }

        }
      }
    }

    for (const instance of tempInstances) {
      if (instance.internal.index == index) {
        console.log('So the final instance is ', instance.chainInfo)
      }
    }


    setInstances(tempInstances)
  }

  const updateDeadlinesAndImplementingPermitted = async () => {
    if (library === undefined) return null
    let tempInstances = [...instances]
    for (const instance of tempInstances) {
      try {
        let deadlineInSeconds = (await instance.external.votingContract.getDeadline(instance.external.identifier)).toNumber()
        instance.external.deadline = (new Date(deadlineInSeconds * 1000)).toLocaleString();
        let currentTimeInSeconds = Math.floor(Date.now() / 1000)
        instance.external.ttl = Math.max(deadlineInSeconds - currentTimeInSeconds, 0)
      } catch (err) { console.log('No getDeadline method found! Error message: ', err) }

      try {
        let implementingPermitted = await instance.external.votingContract.implementingPermitted(instance.external.identifier)
        instance.external.implementingPermitted = implementingPermitted
      } catch (err) {
        console.log('Cannot call implementingPermitted. Error message: ', err)
      }
    }
    setInstances(tempInstances)
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
      return (new Date(currentTimeInMilliseconds + parseInt(initialNewInstanceValues.deadline) * 1000)).toLocaleString()
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

  const statusFilterOptions = Object.keys(VotingStatusImplement).map((k) => { return { value: k, label: VotingStatusImplement[k as keyof typeof VotingStatusImplement] } })

  const handleDisplayedInstanceChange = (
    event: MultiValue<{
      value: string
      label: VotingStatusImplement
    }>,
    typeOfFilterChange?: string) => {

    if (typeOfFilterChange == "status") {
      let selectedStatusIndices = event.map(({ value, label }) => {
        return votingStatusIndex[VotingStatusImplement[value as keyof typeof VotingStatusImplement]].toString()
      })
      let instanceIds: Array<number> = []
      if (selectedStatusIndices.length == 0) {
        instanceIds = instances.map((inst) => { return inst.internal.index.toNumber() })
      } else {
        for (let j = 0; j < instances.length; j++) {
          let info = instances[j]
          if (info.external.status) {
            let inclusionCondition = selectedStatusIndices.includes(info.external.status)
            let customCondition = selectedStatusIndices.includes("5") && (!["0", "1", "2", "3", "4"].includes(info.external.status))
            if (inclusionCondition || customCondition) {
              instanceIds.push(info.internal.index.toNumber())
            }
          }
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
            options={statusFilterOptions}
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
              <th scope="col" style={deadlineInSecsColStyle}>duration (in sec)</th>
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
                        playground={playground}
                        registeredVotingContracts={registeredVotingContracts}
                        registeredVotingContractsSetter={setRegisteredVotingContracts}
                        detailsHandling={detailsHandling}
                        initialNewInstanceValues={initialNewInstanceValues}
                        initialNewInstanceValuesSetter={setInitialNewInstanceValues} />)
                  }}>New Instance</button>
              </td>
            </tr>
            {/* FIXME: it should filter only those instances where the index is displayedInstances */}
            {displayedInstances.map((displayedIndex) => {
              let instance = instances[displayedIndex]
              let status = instance.external.status ? instance.external.status : ethers.BigNumber.from("0")
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
                <td>{(instance.internal.target.isFunction ? instance.internal.target.name : "") + ` (${instance.internal.target.id})`}</td>
                <td>{formatAddress(instance.pointer.votingContractAddress, 7)}</td>
                <td>{instance.external.deadline ? instance.external.deadline : ""}</td>
                <td>{instance.external.ttl}</td>
                <td className={"table-" + statusColor[statusEnum]}>{instance.external.status ? ellipseString(instance.external.status, 3) : ""}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    onClick={() => {
                      if (selectedInstance[displayedIndex].selected) {
                        // HIDE
                        updateInstanceInfos(instance.internal.index, "all")
                        updateDeadlinesAndImplementingPermitted()
                        // change selection to nothing-is-selected
                        let newInstances = getSelectedInstance()
                        setSelectedInstance(newInstances)
                        // close the details window
                        detailsHandling.focusOnDetailsSetter(false)
                        detailsHandling.detailsSetter(<></>)
                      } else {
                        // SELECT
                        updateInstanceInfos(instance.internal.index, "all")
                        updateDeadlinesAndImplementingPermitted()
                        // change selection to index-is-selected
                        let newInstances = getSelectedInstance(displayedIndex)
                        setSelectedInstance(newInstances)
                        // open the details window
                        detailsHandling.focusOnDetailsSetter(true)
                        detailsHandling.detailsSetter(<VoteOnInstance playground={playground} instance={instance} updateInstanceInfos={updateInstanceInfos} />)

                      }

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


import {
  multipleInputsForms,
  MultipleInputsFormsArgs,
  SimpleFormArgs
} from "./forms/SimpleForm"

import { getPlaygroundViewFunctionsFromInterface } from "../utils/web3"


interface PlaygroundFunctionInfo {
  name: string,
  connected: boolean
}

interface PlaygroundFunctions {
  contract: ethers.Contract,
  info: Array<PlaygroundFunctionInfo>
}


type PlaygroundFormInputValues = {
  [key: string]: {
    regexs: Array<RegExp>,
    satisifiedFormat: boolean,
    inputArgs: Array<SimpleFormArgs>,
    result: any
  }
}



const getIntrospectPlayground: () => JSX.Element = () => {
  const { chainId, library } = useWeb3React<Web3Provider>()

  const [playgroundFunctions, setPlaygroundFunctions] = useState<PlaygroundFunctions>({
    contract: new ethers.Contract(ethers.constants.AddressZero, []),
    info: []
  })

  const [playgroundFormInputValues, setPlaygroundFormInputValues] = useState<PlaygroundFormInputValues>(
    {}
  )


  useEffect(() => {
    updatePlaygroundFunctions(setPlaygroundFunctions)
      .then(() => {
        setPlaygroundFormInitialInputValues(setPlaygroundFormInputValues)
      })

  }, [])

  useEffect(() => {
    updatePlaygroundFunctions(setPlaygroundFunctions).then(
      () => {
        updateOnChangeCallbackForInputFields(setPlaygroundFormInputValues)
      }
    )

  }, [chainId, library])

  const setPlaygroundFormInitialInputValues = async (
    setPlaygroundFormInputValues: Dispatch<SetStateAction<PlaygroundFormInputValues>>
  ) => {
    let viewFunctions = (await getPlaygroundViewFunctionsFromInterface(false))

    let formData: PlaygroundFormInputValues = {}
    for (let j = 0; j < viewFunctions.length; j++) {
      let frag = viewFunctions[j]
      let inputArgs = frag.inputs.map((inp: any, i: number) => {
        let simpleFormArgs: SimpleFormArgs = {
          label: inp.name ? inp.name : i.toString(),
          id: i.toString() + frag.name,
          value: "",
          type: "text",
          placeholder: inp.type,
          minLabelWidth: "30%",
          minInputWidth: "70%",
          onChange: () => { }
        }
        return simpleFormArgs
      })
      let regexs = frag.inputs.map((inp: any) => {
        if (inp.type.startsWith('bytes')) {
          let digits = parseInt(inp.type.slice(5,)) * 2
          return new RegExp(`^0x[0-9A-Fa-f]{${digits}}$`)
        } else if (inp.type.startsWith('address')) {
          return new RegExp(`^0x[0-9A-Fa-f]{40}$`)
        } else if (inp.type.startsWith('uint')) {
          return new RegExp(`^[0-9]+`)
        } else {
          return new RegExp(`^[0-9A-Za-z]+`)
        }
      })
      let satisifiedFormat = frag.inputs.length == 0 ? true : false
      formData[frag.name] = {
        inputArgs: inputArgs,
        regexs: regexs,
        satisifiedFormat: satisifiedFormat,
        result: ""
      }

    }

    setPlaygroundFormInputValues(formData)
  }

  const updatePlaygroundFunctions = async (
    setPlaygroundFunctions: Dispatch<SetStateAction<PlaygroundFunctions>>
  ) => {
    let info = (await getPlaygroundViewFunctionsFromInterface(false))
      .map((f) => {
        return {
          name: f.name,
          connected: (chainId && library) ? true : false
        }
      })
    let contract = (chainId && library) ?
      (await getPlaygroundContract(chainId, false)).connect(library.getSigner()) :
      new ethers.Contract(ethers.constants.AddressZero, []);

    setPlaygroundFunctions({
      contract: contract,
      info: info
    })
  }

  const updateOnChangeCallbackForInputFields = async (
    setPlaygroundFormInputValues: Dispatch<SetStateAction<PlaygroundFormInputValues>>
  ) => {
    let playgroundFormInputValuesTemp = { ...playgroundFormInputValues }
    for (const v of Object.values(playgroundFormInputValuesTemp)) {
      for (const inp of v.inputArgs) {
        inp.onChange = (event) => handleInputUpdate(event)
      }
    }
    setPlaygroundFormInputValues(playgroundFormInputValuesTemp)
  }



  const updateViewFunctionOutputs = async (event: any, whichFragment: string) => {
    let playgroundFormInputValuesTemp = { ...playgroundFormInputValues }
    if (whichFragment != "all") {
      // do nothing yet
      let inputValues = playgroundFormInputValuesTemp[whichFragment].inputArgs.map((a) => { return a.value })
      let result = await playgroundFunctions.contract[whichFragment](...inputValues)
      // let decodedFunctionResult = playgroundFunctions.contract.interface.decodeFunctionResult(whichFragment, result)
      console.log('decodedFunctionResult TEst', result)
      playgroundFormInputValuesTemp[whichFragment].result = result
      setPlaygroundFormInputValues(playgroundFormInputValuesTemp)
    }
    else {
      let satisfyingFragments = Object.keys(playgroundFormInputValuesTemp).filter((fr) => playgroundFormInputValuesTemp[fr].satisifiedFormat)
      let satisfyingFragmentsResults = await Promise.all(
        satisfyingFragments.map((fr) => {
          let inputValues = playgroundFormInputValuesTemp[fr].inputArgs.map((a) => { return a.value })
          return playgroundFunctions.contract[fr](...inputValues)
        })
      )
      satisfyingFragmentsResults.forEach((result, i) => {
        playgroundFormInputValuesTemp[satisfyingFragments[i]].result = result
      })
      // console.log(satisfyingFragments)
      setPlaygroundFormInputValues(playgroundFormInputValuesTemp)
    }
    // TODO: Also do the other way around ("all")

  }

  const handleInputUpdate = (
    event: any
  ) => {
    let index = event.target.id.match(/^\d+/)[0];
    let functionName = event.target.id.slice(index.length,)
    let playgroundFormInputValuesTemp = { ...playgroundFormInputValues }
    playgroundFormInputValuesTemp[functionName].inputArgs[parseInt(index)].value = event.target.value
    let satisifiedFormat = playgroundFormInputValuesTemp[functionName].inputArgs.every((arg, ind) => {
      return arg.value.match(playgroundFormInputValuesTemp[functionName].regexs[ind])
    })
    playgroundFormInputValuesTemp[functionName].satisifiedFormat = satisifiedFormat
    setPlaygroundFormInputValues(playgroundFormInputValuesTemp)
  }

  return (
    <div key="hallo" className="row">
      <div>
        Here we see all the view functions of the Playground Contract.
        Once you are connected you may inspect every single one of them or update them all at once.
      </div>
      <div>
        <div style={{ display: "inline-block", padding: "2px", width: "70%" }}>

        </div>
        <div style={{ display: "inline-block", padding: "2px", width: "30%", textAlign: "right" }}>
          <button
            onClick={(event) => updateViewFunctionOutputs(event, "all")}
            style={{ width: "90%", margin: "2px" }} className="btn btn-primary" disabled={library === undefined}>
            {library ? "View all" : "Please connect!"}
          </button>
        </div>
      </div>
      <hr />
      {playgroundFunctions.info.map(f => {
        if (!(f.name in playgroundFormInputValues)) return <></>
        return (
          <div className="card" style={{ marginBottom: "5px", marginTop: "5px", backgroundColor: "beige" }}>
            <div>
              <div style={{ display: "inline-block", padding: "2px", width: "70%" }}>
                {f.name}
              </div>
              <div style={{ display: "inline-block", padding: "2px", width: "30%", textAlign: "right" }}>
                <button
                  style={{ width: "90%", margin: "2px" }}
                  className="btn btn-primary"
                  disabled={!f.connected || !playgroundFormInputValues[f.name].satisifiedFormat}
                  onClick={(e) => updateViewFunctionOutputs(e, f.name)}>
                  {f.connected ? "View" : "Please connect!"}
                </button>
              </div>
            </div>
            <div style={{
              display: f.connected ? "inline-block" : "none",
              backgroundColor: "white",
              width: "100%"
            }}>
              {playgroundFormInputValues[f.name] ? multipleInputsForms({ inputFields: playgroundFormInputValues[f.name].inputArgs }) : <></>}
            </div>
            <div style={{
              display: playgroundFormInputValues[f.name].result == "" ? "none" : "inline-block",
              backgroundColor: "white",
              width: "100%"
            }}>
              {Array.isArray(playgroundFormInputValues[f.name].result) ?
                Object.keys(playgroundFormInputValues[f.name].result)
                  .filter((ent: any, i: number) => { return i >= playgroundFormInputValues[f.name].result.length })
                  .map((ent: any, i: number) => {
                    let outputResult = playgroundFormInputValues[f.name].result[ent]
                    if (ent == "operation") {
                      if (outputResult == 0) {
                        outputResult = "addition"
                      } else if (outputResult == 1) {
                        outputResult = "subtraction"
                      } else {
                        outputResult = "multiplication"
                      }
                    } else {
                      outputResult = outputResult.toString()
                    }
                    return (
                      <>
                        {`${ent}: ${outputResult}`}<br />
                      </>
                    )
                  }) :
                playgroundFormInputValues[f.name].result.toString()
              }
            </div>
          </div>)
      })}
    </div>
  )
}


const PlaygroundComp: React.FC<PlaygroundArgs> = ({ detailsHandling }: PlaygroundArgs) => {

  const initialDisplaySection: SectionFlags = {
    [Sections.WhatIsDaoAbout]: true,
    [Sections.CurrentVotes]: true,
    [Sections.ViewFunctions]: true
  }

  const [displaySection, setDisplaySection] = useState<SectionFlags>(initialDisplaySection)


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
          It can be set either to addition {"(Operation = 0)"}, subtraction {"(Operation = 1)"} or  multiplication {"(Operation = 2)"} via the function <span style={linkStyle}>changeOperation(Operation newOperation)</span>.
          {/* 
          Functions that can be triggered by anyone (1) are all the view functions and the addition of a new voting contract into the DAO's storage.
          Naturally, one may also deposit the native currency into the contract. This triggers the receive() function and the deposit gets recorded in the contract. */}

        </p>
      </>
    ),
    [Sections.CurrentVotes]: getCurrentVotingInstances(detailsHandling),
    [Sections.ViewFunctions]: getIntrospectPlayground()
    // [Sections.ExecutableFunctions]: getPlaygroundExecutables()
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
        </span>
      </p>

      We have created a hypothetical DAO with several functions, each of which can either be triggered:
      <ol>
        <li> by anyone,</li>
        <li> only through a vote,</li>
        <li> by some with rights or through a vote.</li>
      </ol>
      {Paragraphs}
    </div>
  )
}

export {
  PlaygroundComp
}