export type SelectedPageOptions = "voting-contracts" | "voting-playground"

export interface FocusOnDetailsVarAndSetter {
  flag: boolean,
  setter: (arg: boolean) => void
}

export interface InputDataOneEntry {
  label: string,
  specification: string,
  value: string
}