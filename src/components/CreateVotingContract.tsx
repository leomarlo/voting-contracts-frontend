
import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import { bootstrapColors } from "../utils/bootstrap";
import Select, { SingleValue } from 'react-select'
import { DetailsHandling } from "../types/components";
import { ContractInterfaceInfo } from "./ContractInterfaceInfo";

const licenseOptions = [
  "GPL-3.0",
  "MIT",
  "UNLICENSED"
]

const pragmaOptions = [
  "^0.8.13",
  "^0.8.12"
]

enum ContentKeys {
  License,
  Pragma,
  Imports,
  Info,
  Name,
  Dependencies,
  Constructor,
  Start,
  Vote,
  Implement,
  DecodeVotingParams,
  EncodeVotingParams,
  Main,
  SupportsInterface,
}

const votingContractDependencies = [
  "IERC165",
  "IVotingContract",
  "CallbackHashPrimitive",
  "TargetGetter",
  "StatusGetter",
  "CheckCalldataValidity",
  "TokenPrimitive",
  "NoDoubleVoting",
  "IGetDoubleVotingGuard",
  "IGetToken",
  "HandleDoubleVotingGuard",
  "CastYesNoAbstainVote",
  "IGetDeadline",
  "Deadline",
  "IGetQuorum",
  "QuorumPrimitive",
  "ImplementingPermitted",
  "BaseVotingContract",
  "ExpectReturnValue",
  "HandleImplementationResponse",
  "ImplementResult"
]

const possibleVotingParams = [
  "deadline",
  "quorum",
  "token",
  "expectReturnValue",
  "doubleVotingGuard"]


interface VotingContractsArgs {
  detailsHandling: DetailsHandling
}

type ContentValues = {
  rows: Array<{ text: string, info: string }>
  visible: boolean
}

type ContentMappingForContractCode = {
  [name in ContentKeys]: ContentValues
}

interface ContractCode {
  text: string,
  content: ContentMappingForContractCode,
  totalRows: number,
  reverseLookup: { [key: string]: Array<ContentKeys> },
  variables: { [key: string]: Array<string> },
  events: { [key: string]: Array<string> },
  errors: { [key: string]: Array<string> },
  functions: { [key: string]: Array<{ name: string, content: Array<string> }> },
  modifiers: { [key: string]: Array<{ name: string, content: Array<string> }> },
  allowEditing: boolean
}

interface VotingParamOptions {
  options: {
    deadline?: boolean,
    quorum?: boolean,
    doubleVotingGuard?: boolean,
    token?: boolean,
    expectReturnValue?: boolean,
    bareBonesImplement?: boolean
    encodeAndDecodeVoting?: boolean
  }
  allDisabled: boolean
}

const createVotingContract: (votingContractsArgs: VotingContractsArgs) => JSX.Element =
  ({ detailsHandling }: VotingContractsArgs) => {
    const { chainId, library } = useWeb3React<Web3Provider>()

    const [contractCode, setContractCode] = useState<ContractCode>({
      text: "",
      totalRows: 6,
      content: {
        [ContentKeys.License]: { rows: [], visible: false },
        [ContentKeys.Pragma]: { rows: [], visible: false },
        [ContentKeys.Imports]: { rows: [], visible: false },
        [ContentKeys.Info]: { rows: [], visible: false },
        [ContentKeys.Name]: { rows: [], visible: false },
        [ContentKeys.Dependencies]: { rows: [], visible: false },
        [ContentKeys.Constructor]: { rows: [], visible: false },
        [ContentKeys.DecodeVotingParams]: { rows: [], visible: false },
        [ContentKeys.EncodeVotingParams]: { rows: [], visible: false },
        [ContentKeys.Start]: { rows: [], visible: false },
        [ContentKeys.Vote]: { rows: [], visible: false },
        [ContentKeys.Implement]: { rows: [], visible: false },
        [ContentKeys.Main]: { rows: [], visible: false },
        [ContentKeys.SupportsInterface]: { rows: [], visible: false },
      },
      reverseLookup: {},
      variables: {},
      events: {},
      errors: {},
      functions: {},
      modifiers: {},
      allowEditing: false
    })
    const [contractName, setContractName] = useState<string>("")
    const [votingParamOptions, setVotingParamOptions] = useState<VotingParamOptions>({ options: {}, allDisabled: true })
    const [functionInspection, setFunctionInspection] = useState<{ option?: string, function?: string }>({})
    const [useBareBonesVotingContract, setUseBareBonesVotingContract] = useState<boolean>(true)

    const updateContractCode = (ev: any) => {
      let contractCodeTemp = { ...contractCode }
      contractCodeTemp.text = ev.target.value

      let minLength = contractCodeTemp.text.split('\n').length + 1
      // make sure its at least 36 long
      if (contractCode.allowEditing == true) contractCodeTemp.totalRows = Math.max(36, minLength)
      // Should be at least 6 long
      else contractCodeTemp.totalRows = Math.max(6, minLength)

      setContractCode(contractCodeTemp)
    }

    const updateNameContractCode = (contractCodeTemp: ContractCode, name: string) => {
      if (name != "") {
        let rows = []
        if (contractCodeTemp.content[ContentKeys.Dependencies].rows.length > 0) {
          rows.push({ text: `contract ${name} is`, info: "name" })
          rows = rows.concat(contractCodeTemp.content[ContentKeys.Dependencies].rows)
          rows.push({ text: `{`, info: "name" })
        } else {
          rows.push({ text: `contract ${name} {`, info: "name" })
        }
        contractCodeTemp.content[ContentKeys.Name] = {
          rows: rows,
          visible: true
        }
        // reverseResolution
        contractCodeTemp.reverseLookup["name"] = [ContentKeys.Name]
      } else {
        // The following would delete all rows with name in it:
        // deleteFromContractCode(contractCodeTemp, "name")
        // But we would like to delete all rows of the Name content key
        contractCodeTemp.content[ContentKeys.Name].rows = []
        contractCodeTemp.content[ContentKeys.Name].visible = false

      }
    }

    const getTotalRows = (text: string, freestyle: boolean) => {
      let minLength = text.split('\n').length + 1
      // make sure its at least 36 long
      if (freestyle) return Math.max(36, minLength)
      // Should be at least 6 long
      else return Math.max(6, minLength)

    }

    const handleChooseFreestyleEntries = (ev: any) => {


      let contractCodeTemp = { ...contractCode }

      contractCodeTemp.allowEditing = ev.target.checked
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(contractCodeTemp.text, ev.target.checked)

      setContractCode(contractCodeTemp)


    }

    const deleteFromContractCode = (contractCodeTemp: ContractCode, whichOption: string) => {
      // delete the rows with deadline in them
      if (!(whichOption in contractCodeTemp.reverseLookup)) return null
      console.log('Inside deleteFromContractCode')
      for (let contentKey of contractCodeTemp.reverseLookup[whichOption]) {
        contractCodeTemp.content[contentKey].rows = contractCodeTemp.content[contentKey].rows.filter(r => {
          return r.info != whichOption
        })
        // change visibility if needed
        let visible: boolean = (contractCodeTemp.content[contentKey].rows.length == 0 ?
          false :
          contractCodeTemp.content[contentKey].visible)
        contractCodeTemp.content[contentKey].visible = visible
        // run Name field (beginning of contract) if needed
        if (contentKey == ContentKeys.Dependencies) {
          updateNameContractCode(contractCodeTemp, contractName)
        }
      }

      // delete the deadline variables, errors, events, functions and modifiers
      contractCode.variables[whichOption] = []
      contractCode.errors[whichOption] = []
      contractCode.events[whichOption] = []
      contractCode.functions[whichOption] = []
      contractCode.modifiers[whichOption] = []
    }

    const updateDependencies = (dependencies: ContentValues, newDependency: { text: string, info: string }) => {

      // makes sure that there are no conflicts in the inheritance graph
      let newDependencies: ContentValues = { rows: [], visible: true }
      let currentDependencies: Array<string> = dependencies.rows.map((d) => d.text)
      let currentDependenciesMapping: { [dep: string]: number } = {}
      for (let j = 0; j < currentDependencies.length; j++) {
        currentDependenciesMapping[currentDependencies[j]] = j
      }

      console.log(currentDependencies)

      for (let dep of votingContractDependencies) {
        if (currentDependencies.includes(dep)) {
          let i = currentDependenciesMapping[dep]
          newDependencies.rows.push({ ...dependencies.rows[i] })
        } else if (dep == newDependency.text) {
          newDependencies.rows.push({ ...newDependency })
        }
      }

      newDependencies.visible = (newDependencies.rows.length > 0)

      return newDependencies

    }


    function insertContentIntoRows(rows: Array<{ text: string, info: string }>, insertedRows: Array<{ text: string, info: string }>, rowIndex: number): Array<{ text: string, info: string }> {
      return rows.slice(0, rowIndex).concat(insertedRows, rows.slice(rowIndex,))
    }


    function checkWhetherAndWhereRegexAppears(rows: Array<{ text: string, info: string }>, regex: RegExp): (Array<number> | null) {
      let lines: Array<number> = []
      rows.forEach((row, index) => { if (row.text.match(regex)) lines.push(index) })
      if (lines.length > 0) return lines
      return null
    }

    function findLastIndexBeforeThisIndex(indices: Array<number>, thisIndex: number): (number | null) {
      if (indices.length == 0) return null
      if (indices[0] > thisIndex) return null
      let index = 0;
      for (let i = 0; i < indices.length; i++) {
        console.log(`This index is ${thisIndex} and the current index is ${indices[i]}.`)
        if (indices[i] >= thisIndex) break;
        index = indices[i];
      }
      console.log('The winner is', index)
      return index
    }

    // start
    const addVotingParams = (contractCodeTemp: ContractCode, votingParamOptionsTemp: VotingParamOptions, whichOption: string) => {

      let contentKeysWhereOptionIsPresent: Array<ContentKeys> = []
      let variableName = (whichOption == "deadline" ? "duration" : whichOption)
      let variableType = "uint256"
      // TODO: change variable Types depending on whichOption
      if (whichOption == "deadline") { variableType = "uint256" }

      // insert comma after argument, when its the first one
      let firstOption = possibleVotingParams.every((v) => {
        let optionTicked: boolean = votingParamOptionsTemp.options[v as keyof typeof votingParamOptionsTemp.options] ? true : false
        return (v == whichOption || !optionTicked)
      })
      let CommaAfterArgument = firstOption ? "" : ","



      // a flag that is enabled when the encoding functionality is enabled
      let encodeDecodeOfVotingExists: boolean = (
        contractCodeTemp.content[ContentKeys.DecodeVotingParams].visible &&
        contractCodeTemp.content[ContentKeys.EncodeVotingParams].visible)
      let decodeFunctionName: string = (encodeDecodeOfVotingExists ? "decodeParameters" : "abi.decode")
      // check whether decoding already exists in the start function
      let abiDecodeExists: boolean = true
      let abidecodeindex = checkWhetherAndWhereRegexAppears(
        contractCodeTemp.content[ContentKeys.Start].rows,
        new RegExp("abi.decode"))
      // could still be the old one though ()
      if (abidecodeindex == null) {
        abiDecodeExists = false
        abidecodeindex = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.Start].rows,
          new RegExp("decodeParameters"))
      }

      let indexStartParanthesesBegin = checkWhetherAndWhereRegexAppears(
        contractCodeTemp.content[ContentKeys.Start].rows,
        /\(/)

      console.log(`We are in addVotingParams and the option is ${whichOption} and abiDecodeExists: ${abiDecodeExists}.`)

      if (abidecodeindex !== null && indexStartParanthesesBegin !== null) {
        // where does the decoded parantheses begin
        // NOTE: abidecodeindex could be abi.decode, even though a decode function exists
        let abidecodeBeginsIndex = findLastIndexBeforeThisIndex(indexStartParanthesesBegin, abidecodeindex[0])
        if (abidecodeBeginsIndex == null) { throw "Couldnt find the beginning of the abi decoding parantheses!" }
        contentKeysWhereOptionIsPresent.push(ContentKeys.Start)


        // if it exists insert option as the first one with a comma
        contractCodeTemp.content[ContentKeys.Start].rows = insertContentIntoRows(
          contractCodeTemp.content[ContentKeys.Start].rows,
          [{ text: `     ${variableName}${CommaAfterArgument}`, info: whichOption }],
          abidecodeBeginsIndex + 1
        )


      } else {
        // if it doesnt exist create a new abi.decode or decodeParameters
        let indexBlockBegins = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.Start].rows,
          /\{/)

        let indexBlockEnds = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.Start].rows,
          /\}/);

        // new decoding Lines
        if (indexBlockBegins !== null && indexBlockEnds !== null) {

          let decodingLines = [
            { text: `    ${variableType} ${variableName};`, info: whichOption },
            { text: "    ", info: "decode" },
            { text: "    (", info: "decode" },
            { text: `     ${variableName}`, info: whichOption }
          ]
          decodingLines.push({
            text: `    ) =  ${decodeFunctionName}(votingParams` +
              (encodeDecodeOfVotingExists ? ");" : `, (${variableType}));`),
            info: "decode"
          })

          // add content to the Start content key
          contractCodeTemp.content[ContentKeys.Start].rows = insertContentIntoRows(
            contractCodeTemp.content[ContentKeys.Start].rows,
            decodingLines,
            indexBlockBegins[0] + 1
          )

          if (whichOption == "deadline") {
            // set the deadline
            let newDeadlineSetter = contractCodeTemp.content[ContentKeys.Start].rows.slice(0, indexBlockEnds[0] + decodingLines.length - 1).concat(
              [
                { text: "    ", info: whichOption },
                { text: `    _setDeadline(identifier, ${variableName});`, info: whichOption },
              ],
              contractCodeTemp.content[ContentKeys.Start].rows.slice(indexBlockEnds[0] + decodingLines.length - 1,))
            contractCodeTemp.content[ContentKeys.Start].rows = newDeadlineSetter
          }
        }


        // We do not need to deal with the case that the encodeParameters exists or doesnt
        // because if it is made to exist, then the body is automatically created along with it.

      }

      // now deal with the encode and decode functions


      // if decodeParameters exists:
      if (encodeDecodeOfVotingExists) {
        // DECODE
        // add the options into the DecodeFunctions
        contentKeysWhereOptionIsPresent.push(ContentKeys.DecodeVotingParams)

        // PART I
        // First modify the return statement in the function definition
        // find the index where the return statement begins
        let indexReturnBegins = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
          /returns\(/)
        let indexAbiDecodeBegins = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
          /abi.decode/)
        let indexDecodeParanthesesBegin = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
          /\(/)

        // we need to adjust the index by the inserted row (in case it was inserted)
        let indexShiftDecode = 0;

        if (indexReturnBegins !== null) {
          let newLines = [{ text: `    ${variableType} ${variableName}${CommaAfterArgument}`, info: whichOption }]
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows = insertContentIntoRows(
            contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
            newLines,
            indexReturnBegins[0] + 1
          )
          indexShiftDecode += newLines.length
        }

        // PART II
        // Now modify the body of the decode function


        if (indexAbiDecodeBegins !== null && indexDecodeParanthesesBegin !== null) {
          let indexStartDecodeParanthesesBegin = findLastIndexBeforeThisIndex(indexDecodeParanthesesBegin, indexAbiDecodeBegins[0])
          if (indexStartDecodeParanthesesBegin == null) { throw "Couldnt find the beginning of the abi decoding parantheses!" }

          console.log('HEREE all the indexDecodeParanthesesBegin bigns', indexDecodeParanthesesBegin)
          console.log('HEREE the indexAbiDecodeBegins[0]', indexAbiDecodeBegins[0])
          console.log('HEREE the indexStartDecodeParanthesesBegin', indexStartDecodeParanthesesBegin)
          console.log('HEREE the indexShiftDecode', indexShiftDecode)

          // if it exists insert option as the first one with a comma
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows = insertContentIntoRows(
            contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
            [{ text: `         ${variableName}${CommaAfterArgument}`, info: whichOption }],
            indexStartDecodeParanthesesBegin + indexShiftDecode + 1
          )
          indexShiftDecode += 1

          // also modify the abi.decode statement if necessary
          let beginningOfDecodeString: string = "abi.decode(votingParams, ("
          let newText = contractCodeTemp.content[ContentKeys.DecodeVotingParams]
            .rows[indexAbiDecodeBegins[0] + indexShiftDecode]
            .text.replace(
              beginningOfDecodeString,
              beginningOfDecodeString + `${variableType}${CommaAfterArgument} `)
          console.log("NEWEW", newText)
          contractCodeTemp.content[ContentKeys.DecodeVotingParams]
            .rows[indexAbiDecodeBegins[0] + indexShiftDecode]
            .text = newText


        }

        // ENCODE
        // now add also the encode things
        contentKeysWhereOptionIsPresent.push(ContentKeys.EncodeVotingParams)

        // PART I
        // find first appearance
        let indexEncodeFunctionBegins = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows,
          /function encodeParameters\(/)
        let indexEncodeCallBegins = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows,
          /votingParams = abi.encode\(/)

        // we need to adjust the index by the inserted row (in case it was inserted)
        let indexShiftEncode = 0;

        // add the variable to encode parameters
        if (indexEncodeFunctionBegins !== null) {
          let addedLines = [{ text: `    ${variableType} ${variableName}${CommaAfterArgument}`, info: whichOption }]
          contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows = insertContentIntoRows(
            contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows,
            addedLines,
            indexEncodeFunctionBegins[0] + 1
          )
          indexShiftEncode += addedLines.length
        }

        // Part II 
        // find the first appearance of encoding

        if (indexEncodeCallBegins !== null) {
          contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows = insertContentIntoRows(
            contractCodeTemp.content[ContentKeys.EncodeVotingParams].rows,
            [{ text: `        ${variableName}${CommaAfterArgument}`, info: whichOption }],
            indexEncodeCallBegins[0] + indexShiftEncode + 1
          )
        }

      }

      return contentKeysWhereOptionIsPresent

    }


    function handleEncodeAndDecodeVotingParams(event: any) {

      let votingParamOptionsTemp = { ...votingParamOptions }
      votingParamOptionsTemp.options.encodeAndDecodeVoting = event.target.checked


      let contractCodeTemp: ContractCode = { ...contractCode }

      if (event.target.checked) {
        // Case Event.target.checked = true



        // add the two functions and make them visible
        contractCodeTemp.content[ContentKeys.EncodeVotingParams] = {
          rows: [
            ``,
            `/// @dev encoding the voting parameters`,
            `function encodeParameters(`,
            `)`,
            `public`,
            `pure`,
            `returns(bytes memory votingParams)`,
            `{`,
            ``,
            `    votingParams = abi.encode(`,
            `    );`,
            ``,
            `}`
          ].map(t => { return { text: t, info: "encodeVotingParams" } }),
          visible: true
        }

        contractCodeTemp.content[ContentKeys.DecodeVotingParams] = {
          rows: [
            ``,
            `/// @dev decode parameters`,
            `function decodeParameters(bytes memory votingParams)`,
            `public`,
            `pure`,
            `returns(`,
            `){`,
            ``,
            `    (`,
            `    ) = abi.decode(votingParams, ());`,
            `}`
          ].map(t => { return { text: t, info: "decodeVotingParams" } }),
          visible: true
        }




        contractCodeTemp.reverseLookup["encodeVotingParams"] = [ContentKeys.EncodeVotingParams]
        contractCodeTemp.reverseLookup["decodeVotingParams"] = [ContentKeys.DecodeVotingParams]

        // actually delete what has been there in the start and add the voting params again one by one

        let newRows = []
        let LinesWithTheseInfosToBeDeleted = possibleVotingParams.concat("decode")
        for (let row of contractCodeTemp.content[ContentKeys.Start].rows) {
          if (!LinesWithTheseInfosToBeDeleted.includes(row.info)) { newRows.push(row) }
        }
        contractCodeTemp.content[ContentKeys.Start].rows = newRows

        // add all the votingParameters too
        for (let votingParam of possibleVotingParams) {
          console.log(votingParam)
          if (votingParamOptions.options[votingParam as keyof typeof votingParamOptions.options]) {
            console.log(`${votingParam} is ticked!`)
            addVotingParams(contractCodeTemp, votingParamOptionsTemp, votingParam)
          }
        }


      } else {
        // Case Event.target.checked = false
        // deleteFromContractCode(contractCodeTemp, "encodeVotingParams")
        // deleteFromContractCode(contractCodeTemp, "decodeVotingParams")

        // basically take the line from the DecodeVotingParams function
        // and plug it into the Start function
        let indexAbiDecodeBeginsInDecode = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
          /abi.decode/)
        let indexAbiDecodeBeginsInStart = checkWhetherAndWhereRegexAppears(
          contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows,
          /decodeParameters/)
        if (indexAbiDecodeBeginsInDecode !== null && indexAbiDecodeBeginsInStart !== null) {
          let text = contractCodeTemp.content[ContentKeys.DecodeVotingParams].rows[indexAbiDecodeBeginsInDecode[0]].text
          contractCodeTemp.content[ContentKeys.Start].rows[indexAbiDecodeBeginsInStart[0]].text = text
        }

        contractCodeTemp.content[ContentKeys.EncodeVotingParams] = {
          rows: [],
          visible: false
        }
        contractCodeTemp.content[ContentKeys.DecodeVotingParams] = {
          rows: [],
          visible: false
        }
      }


      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)



      // setting votingParamOptions
      // handling allDisabled field
      let allDisabled = Object.keys(votingParamOptionsTemp.options).every(k => !votingParamOptionsTemp.options[k as keyof typeof votingParamOptionsTemp.options])
      votingParamOptionsTemp.allDisabled = allDisabled
      // set voting params options
      setVotingParamOptions(votingParamOptionsTemp)
    }





    const getTextFromContentRows: ((content: ContentMappingForContractCode) => string) = (content) => {

      let text = Object.keys(content).map((c: any) => {
        let isViz: boolean = content[c as ContentKeys].visible
        let isADependency: boolean = c == ContentKeys.Dependencies
        let isNotIndented: boolean = (c in [
          ContentKeys.License,
          ContentKeys.Pragma,
          ContentKeys.Imports,
          ContentKeys.Info,
          ContentKeys.Name])
        let indentation: string = (isNotIndented ? "" : "    ")
        return ((!isViz || isADependency) ? indentation : content[c as ContentKeys].rows.map(r => (indentation + r.text)).join('\n') + "\n\n")
      }).join("") + (content[ContentKeys.Name].visible ? "\n}\n" : "");
      return text
    }


    const handleAddOrRemoveLicense = (event: SingleValue<{ value: string, label: string }>) => {
      if (event) {
        let contractCodeTemp = { ...contractCode }
        contractCodeTemp.content[ContentKeys.License] = {
          rows: ["// SPDX-License-Identifier: " + event.value]
            .map(t => { return { text: t, info: "license" } }),
          visible: true
        }
        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)

        setContractCode(contractCodeTemp)
      }
    }

    const handlePragmaOptions = (event: SingleValue<{ value: string, label: string }>) => {
      if (event) {
        let contractCodeTemp = { ...contractCode }
        contractCodeTemp.content[ContentKeys.Pragma] = {
          rows: [`pragma solidity ${event.value};`]
            .map(t => { return { text: t, info: "pragma" } }),
          visible: true
        }
        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
        setContractCode(contractCodeTemp)
      }
    }

    const handleContractNameChange = (event: any) => {
      if (event.target.value.match(/[\! || \" || \% || \$ || \^ || \? || \= || \& || \{ || \} || \) || \( || \[ || \] || \§ || \\ || \/ || \- || \* || \+ || \~ || \# || \')]/)) return null
      let newContractName = event.target.value.replace(' ', '_')

      setContractName(newContractName)

      let contractCodeTemp = { ...contractCode }
      updateNameContractCode(contractCodeTemp, newContractName)

      // if no votingOptions Have been selected we will already set 
      // the bare bones contract or (if checked) the base contract  
      if (votingParamOptions.allDisabled) {
        updateBaseOrBareBoneStructure(contractCodeTemp, useBareBonesVotingContract, newContractName)
      }

      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)
    }


    const handleChooseVotingParams = (event: any, typeOfVotingParam: string) => {
      // TODO: also change disableChooseBareBonesContractTemplate
      let votingParamOptionsTemp = { ...votingParamOptions }
      if (typeOfVotingParam == "deadline") {
        // handling the checkbox status
        votingParamOptionsTemp.options.deadline = event.target.checked
        console.log('options', votingParamOptionsTemp.options)
        // handling the info
        let contractCodeTemp = { ...contractCode }
        if (event.target.checked) {
          // add the content whereever it is needed
          let newImportRows = contractCodeTemp.content[ContentKeys.Imports].rows.concat(
            [`import { Deadline } from "@leomarlo/voting-registry-contracts/src/extensions/primitives/Deadline.sol";`]
              .map(t => { return { text: t, info: "deadline" } })
          )
          contractCodeTemp.content[ContentKeys.Imports] = {
            rows: newImportRows,
            visible: true
          }
          contractCodeTemp.content[ContentKeys.Dependencies] = updateDependencies(
            contractCodeTemp.content[ContentKeys.Dependencies],
            { text: "Deadline", info: "deadline" })
          // Whenever you update the dependencies, you MUST also update the name
          updateNameContractCode(contractCodeTemp, contractName)

          // start
          let encodingContentKeys = addVotingParams(contractCodeTemp, votingParamOptionsTemp, "deadline")

          // variables and all that
          contractCodeTemp.variables["deadline"] = ["mapping(uint256=>uint256) internal _deadline;"]
          contractCodeTemp.errors["deadline"] = [
            "DeadlineHasPassed(uint256 identifier, uint256 deadline);",
            "DeadlineHasNotPassed(uint256 identifier, uint256 deadline);"]
          contractCodeTemp.functions["deadline"] = [
            {
              name: "function _setDeadline(uint256 identifier, uint256 duration) internal;",
              content: [
                "function _setDeadline(uint256 identifier, uint256 duration) internal {",
                "\t_deadline[identifier] = block.timestamp + duration;",
                "}"
              ]
            },
            {
              name: "function _deadlineHasPassed(uint256 identifier) internal view returns(bool hasPassed);",
              content: [
                "function _deadlineHasPassed(uint256 identifier) internal view returns(bool hasPassed) {",
                "\thasPassed = block.timestamp > _deadline[identifier];",
                "}"
              ]
            }
          ]
          contractCodeTemp.reverseLookup["deadline"] = [
            ContentKeys.Imports,
            ContentKeys.Dependencies,
            ContentKeys.Name
          ].concat(encodingContentKeys)
        } else {
          // console.log('Halloo')
          deleteFromContractCode(contractCodeTemp, "deadline")
          // TODO: More careful here (re abi and decoding)

          // TODO: What if last option
        }

        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
        setContractCode(contractCodeTemp)


      }

      // handling allDisabled field
      let allDisabled = Object.keys(votingParamOptionsTemp.options).every(k => !votingParamOptionsTemp.options[k as keyof typeof votingParamOptionsTemp.options])
      votingParamOptionsTemp.allDisabled = allDisabled
      console.log('allDisabled', votingParamOptionsTemp)
      // set voting params options
      setVotingParamOptions(votingParamOptionsTemp)

    }



    const handleSeeFunction = (event: any, option: string, func: string) => {
      let tempFunctionInspection = { ...functionInspection }
      if (functionInspection.option == option) {
        tempFunctionInspection.option = undefined
        tempFunctionInspection.function = undefined

      } else {

        tempFunctionInspection.option = option
        tempFunctionInspection.function = func
      }
      setFunctionInspection(tempFunctionInspection)
    }


    const updateBaseOrBareBoneStructure = (
      contractCodeTemp: ContractCode,
      bareBonesFlag: boolean,
      contractNameTemp: string) => {

      if (bareBonesFlag) {
        // delete all the base template code first
        deleteFromContractCode(contractCodeTemp, "baseTemplate")

        // add the bare bones contract
        contractCodeTemp.content[ContentKeys.Imports] = {
          rows: [`import { IVotingContract } from "@leomarlo/voting-registry-contracts/src/votingContractStandard/IVotingContract.sol";`]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Dependencies] =
          updateDependencies(
            contractCodeTemp.content[ContentKeys.Dependencies],
            { text: "IVotingContract", info: "bareBones" })

        // Whenever you update the dependencies, you MUST also update the name
        updateNameContractCode(contractCodeTemp, contractNameTemp)

        contractCodeTemp.content[ContentKeys.Start] = {
          rows: [
            ``,
            `/// @dev starts a new voting instance.`,
            `/// @param votingParams byte-encoded parameters that configure the voting instance`,
            `/// @param callback calldata that gets executed when the motion passes`,
            `/// @return identifier the instance identifier that needs to be referenced to vote on this motion.`,
            `function start(bytes memory votingParams, bytes calldata callback)`,
            `public`,
            `override(IVotingContract)`,
            `returns(uint256 identifier) {`,
            ``,
            `}`,
            ``
          ]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Vote] = {
          rows: [
            `/// @dev casts a vote on a voting instance referenced by the identifier`,
            `/// @param identifier unique identifier of the voting instance on which one would like to cast a vote`,
            `/// @param votingData carries byte-encoded information about the vote`,
            `/// @return status information for the caller, whether the vote has triggered any changes to the status`,
            `function vote(uint256 identifier, bytes calldata votingData) `,
            `public `,
            `override(IVotingContract) `,
            `returns (uint256 status) {`,
            ``,
            `}`,
            ``
          ]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }

        contractCodeTemp.reverseLookup["bareBones"] = [
          ContentKeys.Imports,
          ContentKeys.Dependencies,
          ContentKeys.Name,
          ContentKeys.Start,
          ContentKeys.Vote] // change to push
      } else {
        // First of all delete all the bare bones template
        deleteFromContractCode(contractCodeTemp, "bareBones")

        // now add the Base template "baseTemplate"

        // add the bare bones contract
        contractCodeTemp.content[ContentKeys.Imports] = {
          rows: [
            `import { IVotingContract } from "@leomarlo/voting-registry-contracts/src/votingContractStandard/IVotingContract.sol";`,
            `import { BaseVotingContract } from "@leomarlo/voting-registry-contracts/src/extensions/abstracts/BaseVotingContract.sol";`
          ]
            .map(t => { return { text: t, info: "baseTemplate" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Dependencies] = updateDependencies(
          contractCodeTemp.content[ContentKeys.Dependencies],
          { text: "BaseVotingContract", info: "baseTemplate" })

        // Whenever you update the dependencies, you MUST also update the name
        updateNameContractCode(contractCodeTemp, contractNameTemp)

        contractCodeTemp.content[ContentKeys.Start] = {
          rows: [
            ``,
            `/// @notice We must implement a start function. `,
            `/// @dev This handles the emission of a voting instance created event`,
            `/// @dev It also handles the increment of the identifier. `,
            `function _start(uint256 identifier, bytes memory votingParams, bytes calldata callback)`,
            `internal`,
            `override(BaseVotingContract)`,
            `{`,
            ``,
            `}`,
            ``
          ].map(t => { return { text: t, info: "baseTemplate" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Vote] = {
          rows: [
            `/// @dev We must implement a vote function `,
            `function vote(uint256 identifier, bytes calldata votingData) `,
            `external `,
            `override(BaseVotingContract)`,
            `returns (uint256)`,
            `{`,
            ``,
            `}`,
            ``
          ].map(t => { return { text: t, info: "baseTemplate" } }),
          visible: true
        }
        contractCodeTemp.reverseLookup["baseTemplate"] = [
          ContentKeys.Imports,
          ContentKeys.Dependencies,
          ContentKeys.Name,
          ContentKeys.Start,
          ContentKeys.Vote] // change to push

      }
    }


    const handleBareBonesVotingContracts = (bareBonesFlag: any) => {
      // set the boolean variable
      setUseBareBonesVotingContract(bareBonesFlag ? true : false)

      // depending on whether its checked or not add the template from bare bones or from contract with hooks
      let contractCodeTemp = { ...contractCode }
      updateBaseOrBareBoneStructure(contractCodeTemp, bareBonesFlag, contractName)

      // set the new contract code
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)


    }

    return (
      <div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <p>
            Here you can create your own voting contracts either from templates or freestyle.
          </p>
        </div>
        <hr />
        {/*  Input Freestyle or from Template */}
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <input
            type="checkbox"
            checked={contractCode.allowEditing}
            value={"choooseFromPlaygroundSelectors"}
            id="choooseFromPlaygroundSelectors"
            onChange={(event) => handleChooseFreestyleEntries(event)} />
          <label style={{ paddingLeft: "10px" }}>
            Write the code without a template <span style={{ color: bootstrapColors.danger }}>{contractCode.allowEditing ? "(You will loose your edited changes if you uncheck! Will be fixed in the next version!)" : ""}</span>
          </label>
        </div>
        <hr />
        <div style={{
          display: (contractCode.allowEditing ? "none" : "inline-block"),
          width: "100%"
        }}>
          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <Select
              onChange={(event) => handleAddOrRemoveLicense(event)}
              isDisabled={false}
              // defaultValue={licenseOptions[0]}
              placeholder="Select License ..."
              options={licenseOptions.map((opt) => {
                return {
                  value: opt,
                  label: opt
                }
              })}
              className="basic-select"
              classNamePrefix="select"
            ></Select>
          </div>

          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <Select
              onChange={(event) => handlePragmaOptions(event)}
              isDisabled={false}
              // defaultValue={licenseOptions[0]}
              placeholder="Select Solidity Compiler Version ..."
              options={pragmaOptions.map((opt) => {
                return {
                  value: opt,
                  label: opt
                }
              })}
              className="basic-select"
              classNamePrefix="select"
            ></Select>
          </div>
          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <input
              value={contractName}
              key="ContractNameSelection"
              size={50}
              type="text"
              placeholder="Please select a name ..."
              onChange={handleContractNameChange}
            ></input>
          </div>
          <hr />
          <h5>Template choice</h5>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <input
              type="checkbox"
              checked={useBareBonesVotingContract}
              value={"useBareBones"}
              id="useBareBones"
              disabled={!votingParamOptions.allDisabled}
              onChange={(event) => handleBareBonesVotingContracts(event.target.checked)} />
            <label style={{ paddingLeft: "10px" }}>
              <div style={{ display: "inline", color: (!votingParamOptions.allDisabled ? "gray" : "black") }}>
                Use bare bones Voting Contract template (Recommended to uncheck)
                <span style={{ color: bootstrapColors.danger }}>
                  {contractCode.allowEditing ? "(You will loose your edited changes if you uncheck! Will be fixed in the next version!)" : ""}
                </span>
              </div>
            </label>
          </div>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <span
              onClick={() => {
                // focus on details
                detailsHandling.focusOnDetailsSetter(true)
                // open new details page
                detailsHandling.detailsSetter(<ContractInterfaceInfo whichContract="votingContractStandard" detailshandling={detailsHandling} />)
              }}
              style={{ color: "coral" }}>{"View Voting Contract Standard.      \u261B"}</span>
          </div>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <span style={{ color: "coral" }}>{"View Plain Voting Contract Implementation with basic hooks.      \u261B"}</span>
          </div>
          <hr />
          <div style={{
            display: (useBareBonesVotingContract ? "none" : "block")
          }}>
            <h5>Voting Parameters</h5>
            <div style={{
              display: "block",
              width: "100%",
              padding: "5px",

            }}>
              <input
                type="checkbox"
                checked={votingParamOptions.options.deadline}
                value={"chooseDeadline"}
                id="chooseDeadline"
                onChange={(event) => {
                  handleChooseVotingParams(event, "deadline")
                }}>
              </input><div style={{ display: "inline", marginLeft: "20px" }}> add deadline option </div>
            </div>
            <hr />

            <h5>Add Encode and Decode Parameters</h5>
            <div style={{
              display: "block",
              width: "100%",
              padding: "5px",

            }}>
              <input
                type="checkbox"
                checked={votingParamOptions.options.encodeAndDecodeVoting}
                value={"chooseEncodeDecode"}
                id="chooseEncodeDecode"
                onChange={(event) => {
                  console.log('HII, The current Start function before calling changeEncode looks like this', contractCode.content[ContentKeys.Start].rows)
                  handleEncodeAndDecodeVotingParams(event)
                }}>
              </input><div style={{ display: "inline", marginLeft: "20px" }}> add encode and decode parameters </div>
            </div>
          </div>

        </div>

        <hr />
        {/*  Main Text Area */}
        <div className="row">
          <div
            className="col-12"
            style={{ padding: "5px", marginTop: "10px" }}
            key="VotingContractTextAreaDiv">
            {contractName ? <p style={{ color: "gray" }}>{`Filename: ${contractName}.sol`}</p> : <></>}
            <textarea
              style={{ fontFamily: "monospace" }}
              cols={120}
              rows={contractCode.totalRows}
              disabled={!(contractCode.allowEditing)}
              id="calldata"
              value={contractCode.text}
              onChange={updateContractCode}>
            </textarea>
          </div>
        </div>
        <div className="row">
          <div
            className="col-12"
            style={{ padding: "5px", marginTop: "10px" }}
            key="VotingContractVariablesDiv">
            <h6 style={{ margin: "5px", padding: "5px" }}>Available Variables <span style={{ color: "red" }}>{(contractCode.allowEditing ? "\t(EDITING ENABLED. CANNOT TRACK VARIABLES!)" : "")}</span></h6>
            <div style={{ fontFamily: "monospace", backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
              {Object.keys(contractCode.variables).map((key: any) => {
                console.log('contractCodeVariables', key)
                if (contractCode.variables[key].length > 0) {
                  return (
                    <>
                      {"// " + key}<br />
                      {contractCode.variables[key].map(v => { return <>{v}</> })}
                      <br />
                    </>
                  )
                } else {
                  return <></>
                }


              })}
            </div>

            <h6 style={{ margin: "5px", padding: "5px" }}>Available Functions (you may click on them for inspection) <span style={{ color: "red" }}>{(contractCode.allowEditing ? "\t(EDITING ENABLED. CANNOT TRACK VARIABLES!)" : "")}</span></h6>
            <div style={{ fontFamily: "monospace", backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
              {Object.keys(contractCode.functions).map((key: any) => {
                if (contractCode.functions[key].length > 0) {
                  return (
                    <>
                      {"// " + key}<br />
                      {contractCode.functions[key].map(v => {
                        return (
                          <>
                            <span onClick={(event) => handleSeeFunction(event, key, v.name)}>
                              {v.name}
                            </span>
                            <br />
                          </>)
                      })}
                      <br />
                    </>
                  )
                } else {
                  return <></>
                }

              })}
            </div>
            <div style={{
              display: functionInspection.option ? "inline-block" : "none"
            }}>
              <h6 style={{ margin: "5px", padding: "5px" }}>Inspect Function </h6>
              <div
                style={{
                  fontFamily: "monospace",
                  backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa"
                }}>

                {
                  functionInspection.option ?
                    contractCode.functions[functionInspection.option].filter(f => {
                      return (f.name == functionInspection.function)
                    })[0].content.map(row => {
                      let tab = "\t"
                      let indentationsMatch = row.match(RegExp(`[${tab}]*`))
                      return (
                        <>
                          {indentationsMatch ?
                            <div style={{ color: "darkgoldenrod", display: "inline", marginLeft: `${indentationsMatch[0].length * (10 * 4)}px` }}>
                              {row}
                            </div> :
                            <div style={{ color: "darkgoldenrod", display: "inline" }}>
                              {row}
                            </div>
                          }
                          <br />
                        </>
                      )
                    }) :
                    ""
                }
              </div>
            </div>

          </div>
        </div>

      </div >
    )
  }

export {
  createVotingContract
}