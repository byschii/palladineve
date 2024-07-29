

import { Component, For, createResource, createSignal, Show, ErrorBoundary, createEffect, batch, Switch, Match, Suspense, createMemo, lazy, ResourceActions, Resource } from 'solid-js';
import { Etf, OptimizationPhase, PythonResponseETF, PythonResponseLayer, } from '../../model/model';

import ETFDisplay from './ETFDisplay';
import { createLocalStore, removeIndex, GRIDTailwind } from '../../utils';

import { useAppContext } from '../../AppContext';
import Pocketbase from 'pocketbase';
import Button from '../../components/Button';
import PortfolioOptimizerDisplayBar from './PortfolioOptimizerDisplayBar';
import PortfolioOptimizerDisplayTable from './PortfolioOptimizerDisplayTable';
import { createAsyncMemo } from '../../asyncMemo';

import NumInput from '../../components/NumInput';
import { 
    dowloadedEftFetcher, 
    searchDowloadableEftFetcher, 
    portfolioOptimizationFetcher, 
} from './portfolio_utils';


const PortfolioOptimizer: Component = () =>  {
    const state = useAppContext()!;

    const pb = new Pocketbase(state.host);
    const MIN_ETF:number = 4;
    const MAX_ETF:number = 20;
    const DARK_BORDER = "border-slate-600 rounded-lg border-2"
    const GRID_ONE = GRIDTailwind(1,1,0)

    const [etfs] = createResource<Etf[]>(dowloadedEftFetcher);
    const [etfName, setEtfName] = createSignal<string>("");

    // search available box
    const searchAvalilabelBox = <div class={GRIDTailwind(24,1,1) + " h-full"}>
        <div class="flex">
            <span class="shrink-0 mr-1"><span>Search Available Etfs: </span></span>
            <span>
                <input
                    type="text"
                    placeholder="By Name"
                    onInput={(e) => setEtfName(e.currentTarget.value)} />
            </span>
        </div>
        <div class={"row-span-23 overflow-y-auto "+GRID_ONE+" "+DARK_BORDER}>
            <div>
            <For 
            each={etfs()?.filter(etf => etf.name.toLowerCase().includes(etfName().toLowerCase()))} 
            fallback={<div>Loading...</div>}>
                {
                (etf) => (
                    <div class="m-2 grid grid-cols-13 grid-rows-1 gap-2" >
                        <div class="col-span-12 w-full">
                            <ETFDisplay etf={etf} />
                        </div>
                        <button class="bg-slate-200 hover:bg-slate-300 rounded-lg" onclick={()=>{addToSelected(etf)}}>+</button>
                    </div>
                    ) 
                }
            </For>
            </div>
        </div>
    </div>
    


    const [etfISIN, setEtfISIN] = createSignal<string>("");
    const [etfByISIN] = createResource<Etf[], string>(etfISIN, searchDowloadableEftFetcher);
    const searchDownloadableBox = <div class={GRIDTailwind(24,1,1) + " h-full"}>
        <div class="flex">
            <span class="shrink-0 mr-1"><span>Search Downloadable Etfs</span></span>
            <span><input class="shrink "
                type="text"
                placeholder="By something"
                onInput={(e) => setEtfISIN(e.currentTarget.value)} /></span>
        </div>
        <div class={" row-span-23 overflow-y-auto "+GRID_ONE+" "+DARK_BORDER}>
            <Show when={etfISIN()?.length >= 2 } fallback={<span>Search with 2 character at least..</span>}>
                <ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
                <div><For each={etfByISIN() || []} fallback={<div>Loading...</div>}>
                        {
                        (etf) => (
                            <div class="m-2 grid grid-cols-13 grid-rows-1 gap-2" >
                                <div class="col-span-12 w-full"><ETFDisplay etf={etf} /></div>
                                <button class="bg-slate-200 hover:bg-slate-300 rounded-lg"
                                onclick={()=>{addToSelected(etf)}}>+</button>
                            </div>
                            ) 
                        }
                    </For></div>
                </ErrorBoundary>
            </Show>
        </div>
    </div>


    function addToSelected(etf: Etf) {
        if (selectedEtfs.findIndex((e) => e.isin === etf.isin) !== -1) return;
        setSelectedEtfs(selectedEtfs.length, etf);
    }
    const [selectedEtfs, setSelectedEtfs] = createLocalStore<Etf[]>("selectedEtfs", []);
    const alreadySelectedBox = <div class={GRIDTailwind(24,1,1) + " h-full"}>
        <span >Already Selected : </span>
        <div class={" row-span-23 overflow-y-auto border-blue-400 rounded-lg border-2 "+GRID_ONE}>
            <div>
                <For
                    each={selectedEtfs}
                    fallback={<div>0 etf selected</div>}>
                    {
                    (etf, i) => (
                        <div class="m-2 grid grid-cols-13 grid-rows-1 gap-2" >
                            <button class="bg-slate-200 hover:bg-slate-300 rounded-lg"
                            onclick={()=>{setSelectedEtfs(removeIndex(selectedEtfs, i()))}}>-</button>
                            <div class="col-span-12 w-full"><ETFDisplay etf={etf} /></div>
                        </div>)
                    }
                </For>
            </div>
        </div>
    </div>
    
    const [optimizationErrorMessage, setOptimizationErrorMessage] = createSignal<string>("Error retrieving optimization");
    const [optimizedLayers, setOptimizedLayers] = createResource<PythonResponseLayer[], Etf[]>(selectedEtfs, portfolioOptimizationFetcher);
    const matchEtfSelectionTags = <Match when={state.CurrentOptimizationPhase.g() === OptimizationPhase.ETF_SELECTION}>
        <div class={" row-span-12 " + GRIDTailwind(1, 3, 2)}>
            {searchAvalilabelBox}
            {searchDownloadableBox}
            {alreadySelectedBox}
        </div>
        <div class="justify-self-end m-1 space-x-2">
            <Button displayText='Reset'  expandVertical={true}  onClickAction={()=>{
                setSelectedEtfs([]);
                setEtfName("");
                setEtfISIN("");
                setOptimizedLayers.mutate(undefined);
            }}/>
            <Button displayText='Optimize' expandVertical={true} onClickAction={()=>{
                if(MIN_ETF < selectedEtfs.length && selectedEtfs.length < MAX_ETF){
                    setOptimizedLayers.refetch(selectedEtfs); // ricalcolo l ottimizzazione
                }else{
                    setOptimizationErrorMessage("optimize between "+MIN_ETF+" and "+MAX_ETF+" etfs");
                }
                state.CurrentOptimizationPhase.s(OptimizationPhase.ETF_OPTIMIZATION);
            }}/>
            <Button
                displayText='>' expandVertical={true}
                onClickAction={() => {
                    state.CurrentOptimizationPhase.s(OptimizationPhase.ETF_OPTIMIZATION);
                }}/>
        </div>
    </Match>
    

    const buttonClass = " bg-slate-200 rounded-lg m-1 ";
    const [optimizedLayersIndex, setOptimizedLayersIndex] = createSignal<number>(4);
    const [optimizedLayersBudget, setOptimizedLayersBudget] = createSignal<number>(5000);
    const matchEtfOptimizationTags = <Match when={state.CurrentOptimizationPhase.g() === OptimizationPhase.ETF_OPTIMIZATION}>
        <div class={GRIDTailwind(1, 12, 1) +"  w-full"}>
            <NumInput
                valueGetter={optimizedLayersBudget}
                valueSetter={setOptimizedLayersBudget}
                otherClasses={["rounded-lg", "m-1", "col-span-2"]} />
            <For each={ [0,1,2,3,4,5,6,7,8,9]}>
                {
                    (value) => (
                        <button 
                            class={buttonClass + (value === optimizedLayersIndex() ? " border-2 border-slate-300 " : " ")}
                            onclick={()=>setOptimizedLayersIndex(value)}>
                            {value+1}
                        </button>
                    )
                }
            </For>
        </div>
        <div class={" row-span-11 " + GRIDTailwind(1, 3, 2)}>
            <Show when={optimizedLayers.state === "ready" } 
                fallback={<span>loading optimization...</span>}>
                <ErrorBoundary 
                    fallback={
                        <p class="text-red-900 font-bold">{optimizationErrorMessage()}</p>
                    }>
                    <PortfolioOptimizerDisplayTable
                        selectedEtfs={selectedEtfs}
                        optimization={ optimizedLayers() } 
                        index={optimizedLayersIndex()}
                        budget={optimizedLayersBudget()}
                    />
                    </ErrorBoundary>
            </Show>
        </div>
        <div class="justify-self-end m-1 space-x-2">
            <Button displayText='<' expandVertical={true} onClickAction={()=>{
                state.CurrentOptimizationPhase.s(OptimizationPhase.ETF_SELECTION);
            }}/>
        </div>
    </Match>


    return (
        <div class="h-full w-full p-1">
            <div class="h-full grid grid-cols-1 gap-2 grid-rows-13 ">
                <Switch>
                    {matchEtfSelectionTags}
                    {matchEtfOptimizationTags}
                </Switch>   
            </div>
        </div>
    );
};

export default PortfolioOptimizer
