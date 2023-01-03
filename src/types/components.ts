import React from "react"
import { PageSetter } from "./pages"

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
  deadline: number | ""
}

export interface StartNewInstanceArgs {
  detailsHandling: DetailsHandling,
  initialNewInstanceValues: InitialNewInstanceValues,
  initialNewInstanceValuesSetter: React.Dispatch<React.SetStateAction<InitialNewInstanceValues>>
}