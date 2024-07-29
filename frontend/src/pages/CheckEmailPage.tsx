import { useNavigate } from 'solid-app-router';
import type { Component } from 'solid-js';
import { useAppContext } from '../AppContext';




const CheckEmailPage: Component = () => {

  const navigate = useNavigate();


  const state = useAppContext()!;
  if (state.CurrentUserData.g()?.verified) {
    navigate("/", { replace: true });
  }


  return <div class="grid w-full h-full ">
      <div class="px-2 pb-2 pt-1 ">
        <span class="h-full w-full bg-white rounded-lg justify-center flex m-auto p-2">
          <p class="text-red-900 font-bold">Go check your email, than log-in</p>
      </span>
    </div>
  </div>
  
};

export default CheckEmailPage;