

import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';


import PocketBase from 'pocketbase';
import type { ClientResponseError } from 'pocketbase';

import { createStore } from 'solid-js/store';
import { useNavigate } from 'solid-app-router';
import { useAppContext } from '../AppContext';



type FormFields = {
    //username: string,
    email: string,
    password: string,
    passwordConfirmation: string,
}

const RegistrationPage: Component = () => {
    const state = useAppContext()!;

    const pb = new PocketBase(state.host);
    const users = pb.collection("users")
    const navigate = useNavigate();
    const [getForm, setForm] = createStore<FormFields>({
        //username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
    });

    const updateFormField = (fieldName: string) => (event: Event) => {
        const inputElement = event.currentTarget as HTMLInputElement;
        setForm({
            [fieldName]: inputElement.value
        });
    }

    const dataToSubmit = () => {
        return {
            email: getForm.email,
            password: getForm.password,
            passwordConfirm: getForm.passwordConfirmation
        }
    }



    async function userRegistration(event: Event) {
        event.preventDefault();
        pb.authStore.clear();

        await users.create(dataToSubmit())
        await users.requestVerification(getForm.email)

        navigate("/checkemail", { replace: true });
    }



    return (
        <div class="p-4 h-screen">
            <form id="registrationForm" action='/' method='post' >
                <div class="mt-5 grid grid-cols-2 grid-rows-6 gap-2">
                    <div class="rounded-lg  bg-white col-span-2">
                        <p class="font-medium text-xl">Sign Up</p>
                    </div>

                    <div class="rounded-lg  bg-white col-span-1">Email</div>
                    <input type="email" name="email" class="w-full rounded-lg  bg-white col-span-1" placeholder="Email"
                        value={getForm.email} onChange={updateFormField("email")}
                    />
                    <div class="rounded-lg  bg-white col-span-1">Password</div>
                    <input type="password" name="password" class="w-full rounded-lg  bg-white col-span-1" placeholder="Password" minlength="8"
                        value={getForm.password} onChange={updateFormField("password")}
                    />
                    <div class="rounded-lg  bg-white col-span-1">Password Comfirmation</div>
                    <input type="password" name="password" class="w-full rounded-lg  bg-white col-span-1" placeholder="Password Comfirmation" minlength="8"
                        value={getForm.passwordConfirmation} onChange={updateFormField("passwordConfirmation")}
                    />
                    <button class="w-full bg-blue-300 hover:bg-blue-400 font-medium rounded-lg  bg-white col-span-2"
                        onclick={userRegistration}>
                        <p class="font-medium text-xl">Sign Up</p>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationPage;



