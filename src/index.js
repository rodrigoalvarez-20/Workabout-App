import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(
  <CookiesProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CookiesProvider>,
  document.getElementById('root')
);

