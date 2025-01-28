import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Login';  // Adjust the path as needed
import ResearcherMain from './Researcher/ResearcherMain'; // The main page after login
import DoctorMain from './Doctor/DoctorMain'; // The main page after login
import SignUpPage from './SignUpPage'; // The main page after login
import ChoicePage from './ChoicePage';
import AddPatientData from './Doctor/AddPatientData';
import TrainedModels from './Researcher/TrainedModels';
import RecordsViewer from './Doctor/RecordsViewer';
import Predictor from './Researcher/Predictor.js';
import DPredictor from './Doctor/DPredictor.js';
import RecordsUpdate from './Doctor/RecordsUpdate.js';
import ModelUploader from './Researcher/ModelUploader.js';
import ViewModels from './Researcher/ViewModels.js';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/train-page" element={<TrainedModels/>}/>
        <Route path="/add-patient-data" element={<AddPatientData/>}/>
        <Route path="/choicepage" element={<ChoicePage/>}/>
        <Route path="/researcher-main" element={<ResearcherMain />} />
        <Route path="/doctor-main" element={<DoctorMain/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/records-viewer" element={<RecordsViewer/>}/>
        <Route path="/doctor-predict" element={<Predictor/>}/>
        <Route path="/update-medical-records" element={<RecordsUpdate/>}/>
        <Route path="/model_uploader" element={<ModelUploader/>}/>
        <Route path="/model-viewer" element={<ViewModels/>}/>
        <Route path="/DPredict" element={<DPredictor/>}/>
      </Routes>
    </Router>
  );
}
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
