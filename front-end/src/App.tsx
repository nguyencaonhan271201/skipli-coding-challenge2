import React from 'react';
import './App.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FormPage } from './components/FormPage/FormPage';
import { SearchPage } from './components/SearchPage/SearchPage';
import { ProfilePage } from './components/ProfilePage/ProfilePage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path={"/"}
            element={<FormPage />}
          />
          <Route
            path={"/search"}
            element={<SearchPage />}
          />
          <Route
            path={"/profile"}
            element={<ProfilePage />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
