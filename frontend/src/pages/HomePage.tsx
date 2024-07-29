import type { Component } from 'solid-js';
import { useAppContext } from '../AppContext';
import LandingPage from './LandingPage';
import DashboardPage from './dashboard/DashboardPage';


const Home: Component = () => {

  // https://coolors.co/f1f5f9-e62449-bd75a3-93c5fd 


  const state = useAppContext()!;

  return (
    <div>
      {state.userLoggedIn() ?
        <DashboardPage /> : <LandingPage />}
    </div>

  );
};

export default Home;