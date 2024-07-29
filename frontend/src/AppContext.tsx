import PocketBase from 'pocketbase';
import { createSignal, createContext, useContext, JSXElement, Accessor, Setter } from "solid-js";
import { cookieStorage, createCookieStorage, createStorage } from '@solid-primitives/storage';
import type { PythonResponseLayer, User } from './model/model';
import {OptimizationPhase} from './model/model';


const AppContext = createContext<StateType>();

type AppContextType = {
    children: JSXElement
}

type StateType = {
    userLoggedIn: () => boolean,
    host: string,
    CurrentUserData: {
        g: Accessor<User | undefined>
        s: (u: User | undefined) => void
    },
    CurrentOptimizationPhase: {
        g: Accessor<OptimizationPhase>,
        s: Setter<OptimizationPhase>
    },
    LastOptimizationCache: {
        g: Accessor<PythonResponseLayer[]>,
        s: Setter<PythonResponseLayer[]>
    }
}

export function AppContextProvider(props: AppContextType) {

    // string constants
    const USER_STORE_KEY = "U";
    const STORE_PREFIX = "emailalarm_";
    const PB_HOST = import.meta.env.VITE_PBHOST || "http://localhost:8090"; // process.env.PBHOST || import.meta.env.VITE_SOME_KEY

    console.log("PB_HOST", PB_HOST);

    // pocketbase and storage initialization
    const pb = new PocketBase(PB_HOST);
    const s = createStorage({ api: cookieStorage, prefix: STORE_PREFIX });
    const [store, storeSetter, action] = s;
    const [currentUser, setCurrentUser] = createSignal<User>();
    const [currentOptimizationPhase, setCurrentOptimizationPhase] = createSignal<OptimizationPhase>(OptimizationPhase.ETF_SELECTION);
    const [lastOptimizationCache, setLastOptimizationCache] = createSignal<PythonResponseLayer[]>([]);

    // gets a user from app/login and saves it to the store/stare
    const setAndSaveCurrentUser = (u: User | undefined) => {
        if (u !== undefined) {
            // convert user to json string
            const uJson = JSON.stringify(u);
            storeSetter(USER_STORE_KEY, uJson);
            console.log("set current user: " + uJson);
        }
        setCurrentUser(u);
    }

    // checks if a user has been stored and loads it if so
    const getUserFromStore = () => {
        console.log("getUserFromStore - loading user data from cookie storage");
        const uJson = store[USER_STORE_KEY];
        if (uJson === undefined || uJson === "" || uJson === null || uJson === "undefined") {
            console.log("getUserFromStore - no user data found in cookie storage");
            setCurrentUser(undefined);
        } else {
            const u = JSON.parse(uJson) as User;

            console.log("getUserFromStore - user in cookie storage", u);
            setCurrentUser(u);
        }
    }


    // when app starts
    // get user from store
    // try to login with user from store
    getUserFromStore();



    const state = {
        userLoggedIn: () => {
            let cu = currentUser();
            let dataInAuthStore = pb.authStore.token !== "" && pb.authStore.isValid;
            return cu !== undefined && cu.verified && dataInAuthStore;
        },
        host:PB_HOST,
        CurrentUserData: {
            g: currentUser,
            s: setAndSaveCurrentUser
        },
        CurrentOptimizationPhase:{
            g: currentOptimizationPhase,
            s: setCurrentOptimizationPhase
        },
        LastOptimizationCache:{
            g: lastOptimizationCache,
            s: setLastOptimizationCache
        }
    };

    return (
        <AppContext.Provider value={state}>
            {props.children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}