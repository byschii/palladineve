
import { Component, createSignal } from "solid-js";
import PocketBase from 'pocketbase';
import { useAppContext } from '../../AppContext';
import TextInput from "../../components/TextInput";
import { useNavigate } from "solid-app-router";
import { getCurrentUserDetails } from "../../model/user_functions";
import { UserDetails } from "src/model/model";



const SettingUserInfo: Component = () => {

    const state = useAppContext();

    const pb = new PocketBase(state!.host);
    const user_details = pb.collection("user_details");



    // create signal
    const [bio, setBio] = createSignal<string>("");
    const [nickname, setNickname] = createSignal<string>("");
    const [lastOptimization, setLastOptimization] = createSignal<string>("");


    const changeBio = async (e: Event) => {
        e.preventDefault();

        let data = {
            bio: bio()
        }
        let current_details = await getCurrentUserDetails();

        user_details.update(current_details.id, data, { '$autoCancel': false })
    }

    const changeNickname = async (e: Event) => {
        e.preventDefault();

        let data = {
            nickname: nickname()
        }
        let current_details = await getCurrentUserDetails();

        user_details.update(current_details.id, data, { '$autoCancel': false })
    }

    const initData = async () => {
        const u : UserDetails = (await getCurrentUserDetails());
        setBio(u.bio);
        setNickname(u.nickname)
        setLastOptimization(u.last_optimization)
    }
    initData();



    return (
        <div>
            <div class="grid grid-cols-3 bg-white m-2  p-2 gap-2 rounded-lg">

                <div class="col-span-3 text-xl text-center font-semibold">
                    <span class=" grow">User Info </span>
                </div>

                <div class="  rounded-lg   bg-white">
                    <p>Nickname</p>
                </div>
                <div class="  rounded-lg   bg-white flex">
                    <TextInput otherClasses={["rounded", "grow"]} placeholder="nickname" type="text" valueSetter={setNickname} valueGetter={nickname} />
                </div>
                <div class="  rounded-lg   bg-white flex">
                    <button class="grow bg-blue-300 hover:bg-blue-400 rounded-lg" onclick={changeNickname} >Update</button>
                </div>

                <div class=" rounded-lg bg-white">
                    <p>Last Optimization</p>
                </div>
                <div class={"rounded-lg bg-white bg-slate-200 col-span-2 overflow-y-auto max-h-16"}>
                    <span class={"text-center text-sm break-all tracking-tight " }><p>{ JSON.stringify(lastOptimization()) }</p></span>
                </div>

            </div>
        </div>
    )


}

export default SettingUserInfo;