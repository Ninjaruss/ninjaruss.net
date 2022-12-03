import logo from './logo.svg';
import './App.css';

import React, { Component} from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import LandingPage from "./components/Landing/LandingPage";
import BlogPage from "./components/Blog/BlogPage";
import UndefinedPage from "./components/UndefinedPage"; 

class App extends Component {
  render() { 
    return (
      <div className="App">
        <React.Fragment>
          <Router>
            <Routes>
              <Route exact path="/" element={<LandingPage />} />*
              <Route path="/blog" element={<BlogPage />} />*
              <Route element={<UndefinedPage />} />
            </Routes>
          </Router>
        </React.Fragment>
      </div>
    );
  }
}

export default App;
