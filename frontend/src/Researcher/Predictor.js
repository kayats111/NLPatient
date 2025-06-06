import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Predictor.css"; // your existing CSS
import axios from "axios";
import DrawerMenu from "../DrawerMenu";
import { useRoleLinks } from "../context/FetchContext";
import URLContext from "../context/URLContext";

const Predictor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { links } = useRoleLinks();
  const baseUrl = useContext(URLContext).Predictors;

  // We now expect four possible props in location.state:
  //   modelName: string
  //   modelMetadata: string[]   (fields in the order the model expects)
  //   labels: string[]          (labels for the output)
  //   sample: number[]          (an array of the record's values in the same order as modelMetadata)
  const {
    modelName,
    modelMetadata,
    labels,
    sample: prefillSample, // array of numbers, if we came from RecordsViewer
  } = location.state || {};

  // ─────────────── Local state ───────────────
  const [inputs, setInputs] = useState({});      // { field1: " ", field2: " ", ... }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  // If we have a prefillSample (from RecordsViewer), we'll skip manual entry.
  const isPrefilled = Array.isArray(prefillSample) && prefillSample.length > 0;

  // Initialize "inputs" either from prefillSample or as empty strings
  useEffect(() => {
    if (!Array.isArray(modelMetadata)) return;

    if (isPrefilled) {
      // Build inputs object from prefillSample
      // modelMetadata[i] => prefillSample[i]
      const initialInputs = modelMetadata.reduce((acc, field, idx) => {
        acc[field] = Number(prefillSample[idx]);
        return acc;
      }, {});
      setInputs(initialInputs);
    } else {
      // No sample available: initialize as blank strings
      const initialInputs = modelMetadata.reduce((acc, field) => {
        acc[field] = "";
        return acc;
      }, {});
      setInputs(initialInputs);
    }
  }, [modelMetadata, prefillSample, isPrefilled]);

  // If there's a prefillSample, trigger predict on mount
  useEffect(() => {
    if (isPrefilled && modelName && modelMetadata) {
      handlePredict();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrefilled, modelName, modelMetadata]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePredict = async () => {
    console.log("isPrefilled:", isPrefilled);
    console.log("prefillSample:", prefillSample);
    console.log("inputs (raw):", inputs);

    let numericSample;

    if (isPrefilled) {
      // Use the prefilled numeric array directly
      numericSample = prefillSample.slice();
    } else {
      // Manual entry: convert inputs[field] → Number(...)
      const inputList = modelMetadata.map((field) => inputs[field]?.trim() || "");
      numericSample = inputList.map((x) => Number(x));

      // Validate that every entry is a valid number
      if (numericSample.some((n) => isNaN(n))) {
        setError("All fields must be valid numbers.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const resp = await axios.post(
        baseUrl + "/api/predictors/predict",
        {
          "model name": modelName,
          sample: numericSample,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp.status === 200) {
        setPrediction(resp.data.value);
      } else {
        setError(resp.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };


  // Close modal when clicking outside
  const closeModalOnOutsideClick = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setPrediction(null);
    }
  };

  const handleModalClose = () => {
    setPrediction(null);
    if(isPrefilled){
      navigate("/records-viewer")
    }
    else{
      navigate("/train-page");
    }
    
  };

  useEffect(() => {
    if (prediction) {
      document.addEventListener("click", closeModalOnOutsideClick);
      return () => {
        document.removeEventListener("click", closeModalOnOutsideClick);
      };
    }
  }, [prediction]);

  const isPredictButtonDisabled =
    !isPrefilled &&
    Object.values(inputs).some((val) => val === "" || isNaN(Number(val)));

  // If we don't have modelName or modelMetadata, show an error
  if (!modelName || !Array.isArray(modelMetadata)) {
    return <p>Error: No model selected or metadata unavailable.</p>;
  }

  return (
    <div className="predictor-container">
      <DrawerMenu links={links} />
      <h1 className="heading">Predict for {modelName}</h1>

      {/* If there's no prefill, show manual inputs */}
      {!isPrefilled && (
        <div className="input-container">
          {modelMetadata.map((field, index) => (
            <div key={index} className="input-item">
              <label htmlFor={field} className="label">
                {field}
              </label>
              <input
                id={field}
                type="text"
                className="input"
                value={inputs[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* If isPrefilled, show a summary of the sample (read‐only) */}
      {isPrefilled && (
        <div className="input-container">
          {modelMetadata.map((field, idx) => (
            <div key={idx} className="input-item">
              <label className="label">{field}</label>
              <input
                type="text"
                className="input"
                value={inputs[field]}
                disabled
              />
            </div>
          ))}
        </div>
      )}

      <div className="predict-button-container">
        <button
          className="predict-button"
          onClick={handlePredict}
          disabled={isPredictButtonDisabled || loading}
        >
          {loading ? "Loading..." : "Predict"}
        </button>
      </div>

      {prediction && (
        <div className="predictor-modal-overlay modal-overlay">
          <div className="predictor-modal-content">
            <h2>Prediction Result</h2>
            <div className="predictor-metadata-table">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((field, index) => (
                    <tr key={index}>
                      <th>{field}</th>
                      <td>{prediction[index] || "No result"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="close-modal" onClick={handleModalClose}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Predictor;
