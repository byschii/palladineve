import { Component, ErrorBoundary } from "solid-js";

import SettingUserLogin from "./SettingUserLogin";
import SettingUserState from "./SettingUserImportantData";
import SettingUserInfo from "./SettingUserDetails";

import SettingUserActivity from "./SettingUserActivity";

const SettingPage: Component = () => {


    return (
        <div>
            <SettingUserLogin />
            <SettingUserActivity />
            <SettingUserState />
            <SettingUserInfo />
        </div>
    )
}

export default SettingPage;