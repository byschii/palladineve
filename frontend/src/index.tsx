/* @refresh reload */
import { render } from 'solid-js/web';
import "tailwindcss/tailwind.css";
import { Router } from "solid-app-router"
import { AppContextProvider } from "./AppContext";

import App from './App';
import './index.css'
import './assets/more_grid_rows.css'
import './assets/more_grid_cols.css'
import './assets/more_w_perc.css'

render(
    () => <Router> <AppContextProvider> <App /> </AppContextProvider> </Router>,
    document.getElementById('root') as HTMLElement
);
