import React from 'react'

import "../styles/main.css";

const canvasStyle = {
  backgroundColor: "#efe8e4",
  width: "100vw",
  height: "100vh",
  padding: 0,
  margin: 0,
  zIndex: 1,
  top: 0,
  left: 0
}



const Canvas: React.FC = () => {
  return (
    <canvas id="canvasholder" className="absolute" style={canvasStyle}>
    </canvas>
  )
}

export {
  Canvas
}
