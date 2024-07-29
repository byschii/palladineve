
import { Accessor, Component, createResource, createSignal, ErrorBoundary, Setter, Show } from "solid-js";
import PocketBase from 'pocketbase';
import { useAppContext } from '../../AppContext';
import type { UserImportantData } from "../../model/model";
import { currentUserImportantDataFetcher, getCurrentUserImportantData } from "../../model/user_functions";

// this page shows user data that canno be changed by user
const SettingUserState: Component = () => {


    const state = useAppContext();
    const pb = new PocketBase(state!.host);

    const [userImportantData] = createResource<UserImportantData>(getCurrentUserImportantData);


    

    return <Show when={!userImportantData.loading} fallback="loading">
        <ErrorBoundary fallback="error while loading">
        <div>
            <div class="grid grid-cols-3 bg-white m-2  p-2 gap-2 rounded-lg">

                <div class="col-span-3 text-xl text-center font-semibold">
                    <span class=" grow"> Important Data </span>
                </div>
                
                <div class="rounded-lg bg-white"> <p>Payment Level</p> </div>
                <div class="rounded-lg bg-white flex col-span-2">
                    <span class="text-center text-xl">{userImportantData()?.payment_level}</span>
                </div>

                <div class="rounded-lg bg-white"> <p>Stripe Subscription Id</p> </div>
                <div class="rounded-lg bg-white flex col-span-2">
                    <span class="text-center text-xl">{userImportantData()?.stripe_subscription_id || "-"}</span>
                </div>

                <div class="rounded-lg bg-white"> <p>Free Optimizations</p> </div>
                <div class={"rounded-lg bg-white flex col-span-2" + (userImportantData()!.free_optimizations  > 0 ? " bg-green-100 " : " bg-red-100 ")}> 
                    <span class={"text-center text-xl" }>{ Math.abs(userImportantData()!.free_optimizations  ) }</span>
                </div>

                <div class="rounded-lg bg-white"> <p>JWT</p> </div>
                <div class={"rounded-lg bg-white col-span-2"}>
                    <span class={"text-center text-sm break-all tracking-tight" }><p>{ pb.authStore.token }</p></span>
                </div>

            </div>
        </div>
        </ErrorBoundary>
    </Show>
    

}

export default SettingUserState;