import type { Component } from 'solid-js';
import { useAppContext } from '../AppContext';



const LandingPage: Component = () => {

    // https://coolors.co/f1f5f9-e62449-bd75a3-93c5fd 
    const state = useAppContext();


    /*
    
                <div class="mt-5 grid grid-cols-3 grid-rows-2 gap-2">
                <div class=" rounded-lg  bg-white col-span-2"> Pricing</div>
                <div class=" rounded-lg  bg-white"> Contacts</div>
                <div class=" rounded-lg  bg-white"> free</div>
                <div class=" rounded-lg  bg-white"> little</div>
                <div class=" rounded-lg  bg-white">
                    <ul>
                        <li>
                            mia email
                        </li>
                    </ul>
                </div>
            </div>

    */

    return (
        <div class="p-4 h-full">

            <div class="mt-5 grid grid-cols-3 grid-rows-2 gap-2">
                <div class="rounded-lg  bg-white col-span-2"> Perfectly combine etfs!</div>
                <div class=" rounded-lg  bg-white row-span-2"> try</div>
                <div class=" rounded-lg  bg-white col-span-1">Not sure on which etf to pick?</div>
                <div class=" rounded-lg  bg-white col-span-1">Let Palladineve perfectly balance them</div>
            </div>

            <div class="mt-5 grid grid-cols-3 grid-rows-2 gap-2">
                <div class=" rounded-lg  bg-white row-span-2"> it s easy</div>
                <div class=" rounded-lg  bg-white col-span-2"> How does it works?</div>
                <div class=" rounded-lg  bg-white col-span-2">
                    <ul>
                        <li>register</li>
                        <li>pick you etfs</li>
                        <li>optimize and play with parameters</li>
                    </ul>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;