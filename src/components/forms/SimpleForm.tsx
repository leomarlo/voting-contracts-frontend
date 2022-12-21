import React, { CSSProperties, useState } from "react"

interface SimpleFormArgs {
  label: string,
  key: string,
  value: string,
  minLabelWidth?: string
}

const FormPrimitive: React.FC<SimpleFormArgs> = ({ label, key, value, minLabelWidth }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")
  const formStyle: CSSProperties = {
    minWidth: (minLabelWidth ? minLabelWidth : "280px"),
    textAlign: "right",
    padding: "3px"
  }
  return (
    <div>
      <label htmlFor={id} style={formStyle}>{label + ":  "}</label>
      <input key={id} type="text" defaultValue={value} />
    </div>
  )
}


const SimpleForm: React.FC<SimpleFormArgs> = ({ label, key, value, minLabelWidth }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")

  return (
    <form style={{ margin: "2px" }}>
      < FormPrimitive label={label} key={key} value={value} minLabelWidth={minLabelWidth} />
    </form>
  )
}



export {
  SimpleForm,
  FormPrimitive
}