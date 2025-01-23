import React, { useState, useEffect } from 'react';
import '../slider.css'; // Import the slider CSS file

function TrainPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Train 1' },
    { id: 2, name: 'Train 2' },
    { id: 3, name: 'Train 3' },
    { id: 4, name: 'Train 4' },
  ]);

  const maxAmount = 500;

  // State to track active item
  const [activeItem, setActiveItem] = useState(null);

  // State to track sliders and train/test values for each item
  const [sliders, setSliders] = useState(
    items.reduce((acc, item) => {
      acc[item.id] = { sliderValue: 0, trainValue: 0, testValue: maxAmount };
      return acc;
    }, {})
  );

  // Handle slider value change for a specific item
  const handleSliderChange = (id, e) => {
    const newSliderValue = e.target.value;
    setSliders((prev) => {
      const newSliders = { ...prev };
      newSliders[id] = {
        ...newSliders[id],
        sliderValue: newSliderValue,
        trainValue: newSliderValue,
        testValue: maxAmount - newSliderValue,
      };
      return newSliders;
    });
  };

  // Handle train value input change
  const handleTrainChange = (id, e) => {
    const newTrainValue = Math.min(maxAmount, Math.max(0, e.target.value));
    setSliders((prev) => {
      const newSliders = { ...prev };
      newSliders[id] = {
        ...newSliders[id],
        trainValue: newTrainValue,
        sliderValue: newTrainValue,
        testValue: maxAmount - newTrainValue,
      };
      return newSliders;
    });
  };

  // Handle test value input change
  const handleTestChange = (id, e) => {
    const newTestValue = Math.min(maxAmount, Math.max(0, e.target.value));
    setSliders((prev) => {
      const newSliders = { ...prev };
      newSliders[id] = {
        ...newSliders[id],
        testValue: newTestValue,
        sliderValue: maxAmount - newTestValue,
        trainValue: maxAmount - newTestValue,
      };
      return newSliders;
    });
  };

  // Handle click outside to reset the active item
  const handleClickOutside = () => {
    setActiveItem(null);
  };

//   useEffect(() => {
//     // Add event listener to handle clicks outside of the component
//     document.addEventListener('click', handleClickOutside);

//     // Cleanup the event listener when the component is unmounted
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

  const handleItemClick = (id, e) => {
    e.stopPropagation(); // Prevent the click from being captured by the document
    if (activeItem === id) {
      setActiveItem(null);
    } else {
      setActiveItem(id);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h1>TrainPage</h1>
      <ul style={styles.listContainer}>
        {items.map((item) => (
          <li key={item.id} style={styles.listItem}>
            <button
              onClick={(e) => handleItemClick(item.id, e)}
              style={styles.clickableButton}
            >
              {item.name}
            </button>

            {activeItem === item.id && (
              <div style={styles.sliderContainer}>
                <div style={styles.slider}>
                  <input
                    type="range"
                    min="0"
                    max={maxAmount}
                    value={sliders[item.id].sliderValue}
                    onChange={(e) => handleSliderChange(item.id, e)}
                  />
                </div>
                <div style={styles.valuesContainer}>
                  <div style={styles.value}>
                    <strong>Train: </strong>
                    <input
                      type="number"
                      value={sliders[item.id].trainValue}
                      min="0"
                      max={maxAmount}
                      onChange={(e) => handleTrainChange(item.id, e)}
                      style={styles.inputField}
                    />
                  </div>
                  <div style={styles.value}>
                    <strong>Test: </strong>
                    <input
                      type="number"
                      value={sliders[item.id].testValue}
                      min="0"
                      max={maxAmount}
                      onChange={(e) => handleTestChange(item.id, e)}
                      style={styles.inputField}
                    />
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
    padding: '20px',
  },
  listContainer: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    margin: '10px 0',
  },
  clickableButton: {
    padding: '15px 25px',
    fontSize: '16px',
    backgroundColor: 'hsl(180, 42.50%, 58.40%)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '400px',
    transition: 'background-color 0.3s',
  },
  sliderContainer: {
    marginTop: '20px',
    width: '100%',
    textAlign: 'center',
  },
  slider: {
    marginBottom: '10px',
    width: '100%',
  },
  valuesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  value: {
    fontSize: '18px',
  },
  inputField: {
    width: '80px',
    marginLeft: '10px',
    padding: '5px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
};

export default TrainPage;
