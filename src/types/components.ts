import React from "react"
import { PageSetter } from "./pages"
import { ethers } from "ethers"

export type ComponentSetter = (component: JSX.Element) => void

export interface DetailsHandling {
  focusOnDetails: boolean,
  focusOnDetailsSetter: (arg: boolean) => void,
  detailsSetter: ComponentSetter
  pageSetter: PageSetter
}

export interface InputDataOneEntry {
  label: string,
  specification: string,
  defaultValue: string
}

export type FormSubmissionCallbackType = (
  inputValues: Array<string>,
  contractFragment: string) => void;

export interface InitialNewInstanceValues {
  targetId: string,
  votingContract: string,
  deadline: string
}

export interface RegisteredContractsEventArgs {
  contractAddress: string,
  registrar: string,
  resolver: string
}

export interface RegisteredVotingContract {
  registrationArgs: RegisteredContractsEventArgs,
  instantiation: {
    disabledForTheChosenSelector: boolean,
    chosenSelector?: string
  }
  callTimes: number
}

export interface StartNewInstanceArgs {
  playground: ethers.Contract,
  registeredVotingContracts: Array<RegisteredVotingContract>,
  registeredVotingContractsSetter: React.Dispatch<React.SetStateAction<Array<RegisteredVotingContract>>>,
  detailsHandling: DetailsHandling,
  initialNewInstanceValues: InitialNewInstanceValues,
  initialNewInstanceValuesSetter: React.Dispatch<React.SetStateAction<InitialNewInstanceValues>>
}