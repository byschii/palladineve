
import { Component, Show } from 'solid-js';

import { Etf } from '../../model/model';


type ETFDisplayProps = {
    etf: Etf
}

const ETFDisplay: Component<ETFDisplayProps> = (props:ETFDisplayProps) => {


    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    const qtDati = <Show when={props.etf.data_from.length > 0 && props.etf.data_to.length > 0 }
    fallback={<span class="text-blue-900 font-bold" > - WILL BE UPDATED </span>}>
            <span>
            / Data from {props.etf.data_from} to {props.etf.data_to}
        </span>
    </Show>

    return (
        <div class="bg-slate-200 rounded-lg w-fill p-2 ">
            <p>{props.etf.isin} / {props.etf.ticker}.{props.etf.exchange} </p>
            <p class="truncate">{props.etf.name}</p>
            <p>{capitalizeFirstLetter(props.etf.country)} {qtDati} </p>
        </div>
    );
};

export default ETFDisplay;