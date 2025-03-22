import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DoctorMenuProvider, ResearcherMenuProvider} from "./Context";
import './App.css';
import Login from './Login';
import ResearcherMain from './Researcher/ResearcherMain';
import DoctorMain from './Doctor/DoctorMain';
import SignUpPage from './SignUpPage';
import ChoicePage from './ChoicePage';
import AddPatientData from './Doctor/AddPatientData';
import TrainedModels from './Researcher/TrainedModels';
import RecordsViewer from './Doctor/RecordsViewer';
import Predictor from './Researcher/Predictor.js';
import DPredictor from './Doctor/DPredictor.js';
import RecordsUpdate from './Doctor/RecordsUpdate.js';
import ModelUploader from './Researcher/ModelUploader.js';
import ViewModels from './Researcher/ViewModels.js';
import DoctorDrawerMenu from './Doctor/DoctorDrawerMenu'; // Import the drawer menu

function App() {
  return (
    <DoctorMenuProvider>
      <ResearcherMenuProvider>
        <Router>
          <div>
            <DoctorDrawerMenu /> {/* DrawerMenu will be accessible on all pages */}
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/train-page" element={<TrainedModels />} />
              <Route path="/add-patient-data" element={<AddPatientData />} />
              <Route path="/choicepage" element={<ChoicePage />} />
              <Route path="/researcher-main" element={<ResearcherMain />} />
              <Route path="/doctor-main" element={<DoctorMain />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/records-viewer" element={<RecordsViewer />} />
              <Route path="/doctor-predict" element={<Predictor />} />
              <Route path="/update-medical-records" element={<RecordsUpdate />} />
              <Route path="/model_uploader" element={<ModelUploader />} />
              <Route path="/model-viewer" element={<ViewModels />} />
              <Route path="/DPredict" element={<DPredictor />} />
            </Routes>
          </div>
        </Router>
      </ResearcherMenuProvider>
    </DoctorMenuProvider>
  );
}

export default App;
