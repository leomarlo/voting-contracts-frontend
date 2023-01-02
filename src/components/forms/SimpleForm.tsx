import React, { ChangeEventHandler, CSSProperties, useState } from "react"

interface SimpleFormArgs {
  label: string,
  key: string,
  value: string,
  defaultValue: string,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  minLabelWidth?: string
}

const FormPrimitive: React.FC<SimpleFormArgs> = ({ label, key, value, defaultValue, minLabelWidth, onChange }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")
  const formStyle: CSSProperties = {
    minWidth: (minLabelWidth ? minLabelWidth : "280px"),
    textAlign: "right",
    padding: "3px"
  }
  return (
    <div>
      <label htmlFor={id} style={formStyle}>{label + ":  "}</label>
      <input
        key={id}
        type="text"
        defaultValue={defaultValue}
        value={value}
        onChange={onChange} />
    </div>
  )
}


const SimpleForm: React.FC<SimpleFormArgs> = ({ label, key, value, defaultValue, minLabelWidth }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")

  return (
    <form style={{ margin: "2px" }}>
      < FormPrimitive label={label} key={key} defaultValue={defaultValue} value={value} minLabelWidth={minLabelWidth} />
    </form>
  )
}



export {
  SimpleForm,
  FormPrimitive,
  SimpleFormArgs
}