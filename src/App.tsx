import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { WorkoutPlayer } from './pages/WorkoutPlayer';
import { Admin } from './pages/Admin';
import { RoutinePage } from './pages/RoutinePage';
import { UnitPage } from './pages/UnitPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/workout/:id"    element={<WorkoutDetail />} />
          <Route path="/library"        element={<ExerciseLibrary />} />
          <Route path="/player"         element={<WorkoutPlayer />} />
          <Route path="/admin"          element={<Admin />} />
          <Route path="/admin/rutina"   element={<RoutinePage />} />
          <Route path="/admin/unidades" element={<UnitPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
