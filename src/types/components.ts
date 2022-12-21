export type SelectedPageOptions = "voting-contracts" | "voting-playground"

export interface FocusOnDetailsVarAndSetter {
  flag: boolean,
  setter: (arg: boolean) => void
}
