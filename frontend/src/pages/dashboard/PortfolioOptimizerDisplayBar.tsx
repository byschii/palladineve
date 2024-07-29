
import { Component, For, Show } from 'solid-js';

import { Etf, PythonResponseETF, PythonResponseLayer} from '../../model/model';
import { GRIDTailwind } from '../../utils';


type PortfolioOptimizerDisplayBarProps = {
    selectedEtfs: Etf[],
    portfolioLayers: PythonResponseLayer[] | undefined,
    index: number
    budget: number
}



const PortfolioOptimizerDisplayBar: Component<PortfolioOptimizerDisplayBarProps> = (props:PortfolioOptimizerDisplayBarProps) => {

    if(props.portfolioLayers === undefined) {
        return <div>loading...</div>
    }
    if(props.portfolioLayers.length === 0) {
        return <div>no layers</div>
    }

    const layer = props.portfolioLayers[props.index].etfs;

    // shares = money * perc / 100 / last_price

    function bar(name:string, budget:number, price_per_share:number, percent:number){
        const roundedWidth = Math.round(percent);
        const shareToBuy = Math.round(budget*(percent/100)/price_per_share);
        const widthString = "w-perc" + (roundedWidth ).toString()
        return <div class={GRIDTailwind(1,2,2) + " w-full m-1"}>
            <div class=" truncate justify-self-end "> 
                {name} <b>#{shareToBuy}</b> 
            </div>


            <div class={widthString + " -z-1  bg-red-200 rounded-lg"}>
                <p class="w-full">  </p>

                
            </div>
                
            
             
        </div>
    }


    function layerToRow(layer:PythonResponseETF){
        return bar(
            getEtfName(layer, props.selectedEtfs) + layer.isin + " / " + layer.ticker + "." + layer.exchange,
            props.budget,
            layer.last_price,
            layer.percent)
    }

    function getEtfName(layer:PythonResponseETF, etfs:Etf[]): string{
        const finder = (etf:Etf)=>etf.isin === layer.isin && etf.ticker === layer.ticker && etf.exchange === layer.exchange
        const etf = etfs.find(finder);
        if(etf === undefined) {
            return "???";
        }
        return etf.name;
    }

    
    return (
        <div class={"col-span-3 bg-slate-200 rounded-lg w-fill p-2 m-2" + GRIDTailwind(1,1,0) }>
            <For each={props.portfolioLayers[props.index].etfs.sort((a:PythonResponseETF, b:PythonResponseETF)=>b.percent-a.percent)}>
                {layerToRow}
            </For>


        </div>
    );
};

export default PortfolioOptimizerDisplayBar;