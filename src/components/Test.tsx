import React, { useState } from "react";

interface dataInput {
  firstName: string,
  lastName: string
}
function App() {
  const [inputList, setInputList] = useState([["", ""]]);

  // handle input change
  const handleInputChange = (e: any, index: number) => {
    const { name, value } = e.target;
    let secondIndex = (name == "firstName") ? 0 : 1
    const list = [...inputList];
    list[index][secondIndex] = value;
    setInputList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = (index: number) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, ["", ""]]);
  };

  return (
    <div className="App">
      <h3><a href="https://cluemediator.com">Clue Mediator</a></h3>
      {inputList.map((x, i) => {
        return (
          <div className="box">
            <input
              name="firstName"
              placeholder="Enter First Name"
              value={x[0]}
              onChange={e => handleInputChange(e, i)}
            />
            <input
              className="ml10"
              name="lastName"
              placeholder="Enter Last Name"
              value={x[1]}
              onChange={e => handleInputChange(e, i)}
            />
            <div className="btn-box">
              {inputList.length !== 1 && <button
                className="mr10"
                onClick={() => handleRemoveClick(i)}>Remove</button>}
              {inputList.length - 1 === i && <button onClick={handleAddClick}>Add</button>}
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 20 }}>{JSON.stringify(inputList)}</div>
    </div>
  );
}

export { App };
