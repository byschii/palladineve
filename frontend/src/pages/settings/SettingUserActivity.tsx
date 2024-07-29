
import { Component, ErrorBoundary, For, Show, createResource, createSignal } from "solid-js";
import PocketBase, { ListResult } from 'pocketbase';
import { useAppContext } from '../../AppContext';
import TextInput from "../../components/TextInput";
import { useNavigate } from "solid-app-router";
import { getCurrentUserDetails } from "../../model/user_functions";
import { UserActivity } from "src/model/model";



const SettingUserActivity: Component = () => {

    const state = useAppContext()!;

    const pb = new PocketBase(state.host);
    const [userActivity, setUserActivity] = createResource<ListResult<UserActivity>>(async () => await pb.collection("user_activity").getList<UserActivity>());

    return <ErrorBoundary fallback="no activy ">
        <Show when={!userActivity.loading} fallback="loading">
            <div class="grid bg-white m-2 p-2 gap-2 rounded-lg max-h-32 overflow-y-auto">

            <div class="grid grid-cols-3 ">
                <span class="text-center font-semibold"> id</span>
                <span class="text-center font-semibold"> type</span>
                <span class="text-center font-semibold"> date </span>
            </div>

            <For each={userActivity()?.items}>
                {(item: UserActivity) => <div class="grid grid-cols-3 ">
                    <span class="text-center" > {item?.id}</span>
                    <span class="text-center"> {item?.activity_type}</span>
                    <span class="text-center"> {item?.created} </span>
                </div>}
            </For>

            </div>
    </Show></ErrorBoundary>



}

export default SettingUserActivity;