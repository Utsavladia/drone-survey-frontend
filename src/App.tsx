import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import Dashboard from './pages/Dashboard/Dashboard';
import Drones from './pages/Drones/Drones';
import MissionPlanning from './pages/MissionPlanning/MissionPlanning';
import Reports from './pages/Reports/Reports';
import Navigation from './components/Navigation/Navigation';
import CreateMission from './pages/MissionPlanning/CreateMission';
import EditMission from './pages/MissionPlanning/EditMission';
import './App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Navigation />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/drones" element={<Drones />} />
                <Route path="/missions" element={<MissionPlanning />} />
                <Route path="/missions/create" element={<CreateMission />} />
                <Route path="/missions/:id/edit" element={<EditMission />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Box>
          </Box>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{height: '50px'}}
          />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
