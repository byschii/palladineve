import { useNavigate } from 'solid-app-router';
import { Component, For, createResource, createSignal, onMount } from 'solid-js';
import { useAppContext } from '../../AppContext';
import NotAuthed from '../../NotAuthed';
import PocketBase from 'pocketbase';
import { UserDetails } from 'src/model/model';
import { getCurrentUserDetails } from '../../model/user_functions';
import Button from '../../components/Button'


type SelectableSideMenu = {
    menuVoices: Array<String>
}

const SideMenuDashboard: Component<SelectableSideMenu> = (props:SelectableSideMenu) => {

  const state = useAppContext()!;

  const pb = new PocketBase(state.host);

  return (
    <div class="h-full w-full px-2 py-1">
    <For each={props.menuVoices} fallback={<div>Loading...</div>}>
        {
          (menuVoice) => 
          <div class="py-1"><Button 
            displayText={String(menuVoice)} 
            expandVertical={false} 
            expandHorizontal={true}
          /></div>
        }

    </For>

  </div>
  );
};

export default SideMenuDashboard;