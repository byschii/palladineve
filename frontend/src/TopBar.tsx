import { Component } from 'solid-js';
import { Link } from "solid-app-router"
import logo from './assets/logo.png';
import Button from './components/Button';
import { useAppContext } from './AppContext';
import PocketBase from 'pocketbase';

const TopBar: Component = () => {

    const state = useAppContext()!;

    const loggedButtons = <div class="justify-self-end m-2  space-x-2">
        <Button displayText="dashboard" linkPath="dashboard" expandVertical={true} />
        <Button displayText="howTo" linkPath="howto" expandVertical={true} />
        <Button displayText="setting" linkPath="setting" expandVertical={true} />
        <Button displayText="logout" linkPath="logout" expandVertical={true} />
    </div>

    const notLoggedButtons = <div class="justify-self-end m-2 space-x-2">
        <Button displayText="howTo" linkPath="howto" expandVertical={true} />
        <Button displayText="login" linkPath="login" expandVertical={true} />
        <Button displayText="register" linkPath="registration" expandVertical={true} />
    </div>

    const img = <img
        src={logo}
        alt="Mail and Poke Me Logo"
        class="object-scale-down h-full"
    />


    return (
        <div id="topbar" class="rounded-xl h-full
        grid grid-cols-2 grid-rows-1
        bg-white" >

            <div class="m-2">
                <Link href="/">
                    {img}
                </Link>
            </div>
            {state.userLoggedIn() ? loggedButtons : notLoggedButtons}

        </div>
    )
};

export default TopBar;