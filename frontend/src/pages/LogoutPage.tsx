import type { Component } from "solid-js";
import PocketBase from 'pocketbase';
import { useAppContext } from '../AppContext';
import { Navigate } from "solid-app-router"


const LogoutPage: Component = () => {

    const state = useAppContext();


    const client = new PocketBase(state!.host);
    client.authStore.clear();
    if (state !== undefined) {
        state.CurrentUserData.s(undefined);
    }

    return (
        <div>
            Logged Out
            <Navigate href="/"></Navigate>
        </div>
    )
}

export default LogoutPage;