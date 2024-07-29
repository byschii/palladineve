import { useNavigate } from 'solid-app-router';
import { Component, createResource } from 'solid-js';
import { useAppContext } from '../../AppContext';
import NotAuthed from '../../NotAuthed';
import PocketBase from 'pocketbase';
import { UserDetails } from 'src/model/model';
import { getCurrentUserDetails } from '../../model/user_functions';
import SideMenuDashboard from './SideMenuDashboard';

import PortfolioOptimizer from './PortfolioOptimizer';



const DashboardPage: Component = () => {

  const state = useAppContext();

  const pb = new PocketBase(state!.host);
  const user_details = pb.collection("user_details");

  const navigate = useNavigate();


  if (!state!.CurrentUserData.g()?.verified) {
    navigate("/checkemail", { replace: true });

  } else if (!state!.userLoggedIn()) {
    console.warn("tu non puoi passare")
    return (
      <NotAuthed />
    )
  }

  const [userDetails, _] = createResource<UserDetails>(getCurrentUserDetails);


  // create the section title tag
  // which spans across the whole page and is centered
  const sectionTitleTag = <div class="h-full bg-white rounded-lg justify-center flex">
      <span class="text-3xl font-bold m-auto">
        <p>Welcome {userDetails()?.nickname} </p>
    </span>
    </div>

  /* just removed useless side menu
  <div class="col-span-1 row-span-12 rounded-lg bg-white ml-2 mt-1 mb-2 mr-1">      
        <SideMenuDashboard  menuVoices={["1111", "2222"]} />
      </div>

      col-span-6 row-span-12 rounded-lg bg-white ml-1 mt-1 mb-2 mr-2 p-2"
      */

  return (
    <div class="h-full grid grid-cols-7 grid-rows-13" >
      <div class="col-span-7 px-2 py-1">
        {sectionTitleTag}
      </div>

      <div class="col-span-7 row-span-12 rounded-lg bg-white ml-2 mt-1 mb-2 mr-2 p-2">
        <PortfolioOptimizer />
      </div>

    </div>
  );
};

export default DashboardPage;