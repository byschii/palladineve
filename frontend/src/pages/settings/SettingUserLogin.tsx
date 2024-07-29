
import { Component, Show, createSignal } from "solid-js";
import PocketBase from 'pocketbase';
import { useAppContext } from '../../AppContext';
import TextInput from "../../components/TextInput";
import { useNavigate } from "solid-app-router";


const SettingUserLogin: Component = () => {

    const state = useAppContext();

    const pb = new PocketBase(state!.host);
    const users = pb.collection("users");
    const navigate = useNavigate();

    // get email from state
    let email:string = "";
    try{
        email = state!.CurrentUserData.g()!.email;
    }catch(e){
        navigate("/")
    }
    // create signal
    const [emailSignal, setEmailSignal] = createSignal<string>(email);
    const [wantsToDelete, setWantsToDelete]= createSignal<boolean>(false);
    const [passwordForDeletion, setPasswordForDeletion] = createSignal<string>("");
    const [wrongPasswordMessage, setWrongPasswordMessage] = createSignal<string>("");


    const changeEmail = (e: Event) => {
        e.preventDefault();
        // if email is not empty and differs from current email
        if (emailSignal() !== "" && emailSignal() !== email) {
            users.requestEmailChange(emailSignal()).then(() => {
                navigate("/logout", { replace: true });
            }
            );

        }
    }

    const changePassword = (e: Event) => {
        e.preventDefault();
        // if password is not empty and its length is greater than 8
        users.requestPasswordReset(email).then(() => {
            navigate("/logout", { replace: true });
        });

    }

    const deleteAccountVerification = (e: Event) => {
        e.preventDefault();
        setWantsToDelete( ! wantsToDelete() )
        console.log("going to delete" + JSON.stringify(state!.CurrentUserData.g()))
    }

    // delete user
    const deleteUser = async () => {
        // first test password
        try{
            let confirmation = await users.authWithPassword(email, passwordForDeletion())

            await users.delete(confirmation.record.id);
            navigate("/logout", { replace: true });
        }catch(e){
            setWrongPasswordMessage("wrong password")
            console.warn("wrong password")
        }

    }

    return (
        <div>
            <div class="grid grid-cols-3 bg-white m-2 p-2 gap-2 rounded-lg">

                <div class="col-span-3 text-xl text-center font-semibold">
                    <span class=" grow"> Login Settings </span>
                </div>

                <div class=" rounded-lg bg-white">
                    <p>Email</p>
                </div>
                <div class=" rounded-lg bg-white flex">
                    <TextInput otherClasses={["rounded", "grow"]} placeholder="email" type="email" valueSetter={setEmailSignal} valueGetter={emailSignal} />
                </div>
                <div class=" rounded-lg  bg-white flex">
                    <button class="grow bg-blue-300 rounded-lg" onclick={changeEmail} >Update (with auto-Logout)</button>
                </div>

                <div class=" rounded-lg bg-white">
                    <p>Password</p>
                </div>
                <div class=" rounded-lg bg-white flex">
                    <button class="grow bg-blue-300 rounded-lg" onclick={changePassword}>Update (with auto-Logout)</button>
                </div>
                <div class=" rounded-lg  ">
                    <p></p>
                </div>

                <div class="  rounded-lg   bg-white flex col-span-1">
                    <button class="grow bg-red-300 hover:bg-red-400 rounded-lg" onclick={deleteAccountVerification}>Delete account</button>
                </div>
                <div></div>
                <div></div>

                <Show when={wantsToDelete() }>
                <div class="  rounded-lg   bg-white ">
                    <p>Insert password to confirm</p>
                </div>
                <div class="  rounded-lg   bg-white flex">
                    <TextInput otherClasses={["rounded", "grow"]} placeholder="password" type="password" valueSetter={setPasswordForDeletion} valueGetter={passwordForDeletion} />
                </div>
                <div class="  rounded-lg   bg-white flex">
                    <button class="grow bg-red-300 hover:bg-red-400 rounded-lg" onclick={deleteUser} >Conflirm</button>
                </div>     
                </Show>


            </div>
        </div>
    )

}

export default SettingUserLogin;