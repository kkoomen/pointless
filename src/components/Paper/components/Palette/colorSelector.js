import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const ColorSelector = () => {
  const [color, setColor] = useState('#fff');

  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  return (
    <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
  );
};

export default ColorSelector;
