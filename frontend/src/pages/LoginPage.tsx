import { Component, useContext } from 'solid-js';
import { useAppContext } from '../AppContext';
import type { User } from '../model/model';
import PocketBase from 'pocketbase';
import { createStore } from 'solid-js/store';
import { useNavigate } from 'solid-app-router';



type LoginFormField = {
    email: string,
    password: string
}


const LoginPage: Component = () => {
    const state = useAppContext();


    const pb = new PocketBase(state!.host);

    console.log("PB = ", pb )
    console.log("state!.host = ", state!.host)

    const navigate = useNavigate();
    const [getForm, setForm] = createStore<LoginFormField>({
        email: "",
        password: "",
    });


    async function userLogin(e: Event) {
        e.preventDefault();
        const form = e.currentTarget! as HTMLFormElement;

        let loginResp = await pb.collection('users').authWithPassword(getForm.email, getForm.password);
        let loginData = loginResp.record as unknown as User;

        console.warn(loginData.verified)
        if (!loginData.verified) {
            navigate("/checkemail", { replace: true });
        } else if (state !== undefined) {
            state.CurrentUserData.s(loginData);

            let urlSplit = form.action.split("/")
            let urlDest = "/" + urlSplit[urlSplit.length - 1];
            console.log(urlDest)
            navigate(urlDest, { replace: true });
        }

    }


    const resetPassword = async (e: Event) => {
        e.preventDefault();
        
        pb.collection('users').requestPasswordReset(getForm.email);
    }

    const updateFormField = (fieldName: string) => (event: Event) => {
        if (fieldName as keyof LoginFormField) {
            const inputElement = event.currentTarget as HTMLInputElement;
            console.log("login " + fieldName + ": " + inputElement.value)

            setForm({
                [fieldName]: inputElement.value
            });
        }
    }

    return (
        <div class=" px-2 pt-1 h-screen">
            <form id="loginForm" action="/dashboard" method="get" onsubmit={userLogin}>
                <div class=" grid grid-cols-2 grid-rows-4 gap-2">
                    <div class=" rounded-lg  bg-white col-span-2">
                        <p class="font-medium text-xl">Login</p>
                    </div>
                    <div class=" rounded-lg  bg-white col-span-1">Email</div>
                    <input type="text" name="email" class="w-full  rounded-lg  bg-white col-span-1" placeholder="Email"
                        value={getForm.email} onChange={updateFormField("email")} />
                    <div class=" rounded-lg  bg-white col-span-1"> Password</div>
                    <input type="password" name="password" class="w-full rounded-lg  bg-white col-span-1" placeholder="Password"
                        value={getForm.password} onChange={updateFormField("password")} />

                    <button class="w-full bg-blue-300 hover:bg-blue-400 font-medium rounded-lg  bg-white" name="login_button" type='submit' >
                        <p class="font-medium text-xl">Login</p>
                    </button>
                </div>
            </form>
            <button class="my-2 w-full bg-blue-200 hover:bg-blue-300 rounded-lg  bg-white" onclick={resetPassword} name="recovery_button" type='submit'>
                <p class="font-medium text-slate-700 hover:text-slate-900 " > Send email with password recovery link (need email)</p>
            </button>
        </div>
    );
};

export default LoginPage;



