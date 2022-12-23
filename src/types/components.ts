export type SelectedPageOptions = "voting-contracts" | "voting-playground"

export interface FocusOnDetailsVarAndSetter {
  flag: boolean,
  setter: (arg: boolean) => void
}

export interface InputDataOneEntry {
  label: string,
  specification: string,
  defaultValue: string
}

export type FormSubmissionCallbackType = (
  inputValues: Array<string>,
  contractFragment: string) => void;