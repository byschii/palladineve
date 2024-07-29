import type { Component } from 'solid-js';
import { Route, Routes, hashIntegration } from "solid-app-router"


import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import LogoutPage from './pages/LogoutPage';
import SettingPage from './pages/settings/SettingPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CheckEmailPage from './pages/CheckEmailPage';
import TopBar from './TopBar';
import HowToPage from './pages/HowToPage';




// <Route path="/pricing" component={PricingPage} />
const App: Component = () => {

  return (
    <div class="h-screen grid grid-cols-1 grid-rows-13" >
        <div class="col-span-1 px-2 pb-1 pt-2">
          <TopBar />
        </div>
        <div class="col-span-1 row-span-12">
          <Routes>
            <Route path="/howto" component={HowToPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/registration" component={RegistrationPage} />
            <Route path="/logout" component={LogoutPage} />
            <Route path="/setting" component={SettingPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/checkemail" component={CheckEmailPage} />

            <Route path="/" component={LandingPage} />
          </Routes>
        </div>
    </div>
  );
};

export default App;
/*

*/