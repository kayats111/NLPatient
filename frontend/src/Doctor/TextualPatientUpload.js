import React, { useState,useContext} from 'react';
import './TextualPatientUpload.css';
import axios from 'axios';
import DrawerMenu from '../DrawerMenu'; 
import URLContext from '../context/URLContext';
import { useRoleLinks } from "../context/FetchContext";

const TextualPatientUpload = () => {
    const [mainText, setMainText] = useState('');
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    const [field3, setField3] = useState('');
    const [field4, setField4] = useState('');
    const [message, setMessage] = useState(null);
    const {links} = useRoleLinks();
    const url = useContext(URLContext).DataManager

    const handleSubmit = async() => {
    const payload = {
        text: mainText,
        affective:field1,
        any:field2,
        bipolar:field3,
        schizophreniaSpectr:field4,
    };
    try {
        console.log(url)
        const response = await axios.post(`${url}/api/data/text/add`, payload);
        const data = response.data;

        if (data.error) {
        setMessage(`Error: ${data.message}`);
        } else {
        setMessage("Text data uploaded successfully!");
        // Clear inputs
        setMainText('');
        setField1('');
        setField2('');
        setField3('');
        setField4('');
        }
    } catch (error) {
        console.error(error);
        setMessage("Failed to upload data. Please try again.");
    }
    };

  return (
    <div className="textual-upload-container">
      <DrawerMenu links = {links} />  
      <h1>Upload Textual Patient Data</h1>

      <textarea
        className="large-textarea"
        value={mainText}
        onChange={(e) => setMainText(e.target.value)}
        placeholder="Paste or type patient notes here..."
      />

      <div className="fields-row">
        <div className="field-group">
          <label htmlFor="field1">affective</label>
          <input
            id="field1"
            type="text"
            value={field1}
            onChange={(e) => setField1(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="field2">any</label>
          <input
            id="field2"
            type="text"
            value={field2}
            onChange={(e) => setField2(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="field3">bipolar</label>
          <input
            id="field3"
            type="text"
            value={field3}
            onChange={(e) => setField3(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="field4">schizophreniaSpectr</label>
          <input
            id="field4"
            type="text"
            value={field4}
            onChange={(e) => setField4(e.target.value)}
          />
        </div>
      </div>

      <button className="submit-button" onClick={handleSubmit}>Submit</button>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default TextualPatientUpload;