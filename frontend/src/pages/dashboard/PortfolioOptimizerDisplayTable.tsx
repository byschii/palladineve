
import { Component, For, Match, Resource, lazy, Switch, createSignal, ErrorBoundary, Show } from 'solid-js';

import { Etf, PythonResponseETF, PythonResponseLayer} from '../../model/model';
import { GRIDTailwind, createLocalStore } from '../../utils';
import { SetStoreFunction } from 'solid-js/store';
import { providerScope } from 'solid-use';
import { useAppContext } from '../../AppContext';

type PortfolioOptimizerDisplayBarProps = {
  selectedEtfs: Etf[],
  optimization: PythonResponseLayer[] | undefined,
  index: number
  budget: number
  useCache?: boolean
}

type PortfolioTableRow = {
  name: string,
  isin: string,
  ticker: string,
  exchange: string,
  num_shares: number,
  percent: number,
  last_price: number
}

const PortfolioOptimizerDisplayTable: Component<PortfolioOptimizerDisplayBarProps> = (props:PortfolioOptimizerDisplayBarProps) => {
  const state = useAppContext()!;

  

  let validResource = (props.optimization !== undefined) && (props.optimization.length !== 0)
  if(validResource){
    console.warn("setting cache")
    // set cache
    state.LastOptimizationCache.s(props.optimization!)
  }

  function getEtfName(layer:PythonResponseETF, etfs:Etf[]): string{
    const finder = (etf:Etf)=>etf.isin === layer.isin && etf.ticker === layer.ticker && etf.exchange === layer.exchange
    const etf = etfs.find(finder);
    if(etf === undefined) {
        return "???";
    }
    return etf.name;
  }

  function convertLayerToPortfolioRow(layer:PythonResponseETF, selectedEtfs: Etf[], budget:number): PortfolioTableRow{
    return {
      name: getEtfName(layer, selectedEtfs),
      isin: layer.isin,
      ticker: layer.ticker,
      exchange: layer.exchange,
      num_shares: Math.round(budget*(layer.percent/100)/layer.last_price),
      percent: layer.percent,
      last_price: layer.last_price      
    }
  }

  function convertPortfolioRowToTD(row: PortfolioTableRow){
    const tRowClass = "flex justify-center" + (row.num_shares === 0 ? " text-sm text-gray-600" : "")

    return <tr>
      <td><div class={tRowClass}>{row.name}</div></td>
      <td><div class={tRowClass + (row.num_shares > 0 ? " text-lg " : "" )}>{row.num_shares}</div></td>
      <td><div class={tRowClass}>× {row.last_price}€ = {Math.round(row.num_shares* row.last_price)}€ →</div></td>
      <td><div class={tRowClass}>{Math.round(row.percent * 10) / 10}%</div></td>
      <td><div class={tRowClass}>{row.isin}</div></td>
      <td><div class={tRowClass}>{row.ticker}</div></td>
      <td><div class={tRowClass}>{row.exchange}</div></td>
    </tr>
  }

  function genCaption(layer: PythonResponseLayer){
    return <caption>
      Portfolio Layer <b>{props.index+1}</b>,
      Expected Return: <b>{Math.round(layer.expected_return * 1000)/1000 }</b>,
      Risk: <b>{Math.round(layer.risk * 1000)/1000 }</b>,
      Sharpe Ratio: <b>{Math.round(layer.sharpe_ratio * 1000)/1000 }</b>
    </caption>
  }

  const layerSorter = (a:PythonResponseETF, b:PythonResponseETF) => b.percent - a.percent;
  const toPortfolioRowConverter = (layer:PythonResponseETF)=>convertLayerToPortfolioRow(layer, props.selectedEtfs, props.budget)
  const toTDConverter = (layer:PortfolioTableRow)=>convertPortfolioRowToTD(layer)

  const tableHead = <thead><tr>
    <th>Name</th>
    <th>Num Shares</th>
    <th>Money</th>
    <th>Percent</th>
    <th>ISIN</th>
    <th>Ticker</th>
    <th>Exchange</th>
  </tr></thead>


  if(validResource){
    return <ErrorBoundary fallback={<div class="text-red-900 font-bold">Something went wrong</div>}>    
      <table class="col-span-3 w-full">
            {genCaption(props.optimization![props.index])}
            {tableHead}
            <tbody>
              <For each={
                props.optimization![props.index].etfs.sort(layerSorter).map(toPortfolioRowConverter).map(toTDConverter)
                }>
                {layer => <>{layer}</> }
              </For>
            </tbody>
        </table>      
      </ErrorBoundary>
  }else{
    return  <table class="col-span-3 w-full">
          {genCaption(state.LastOptimizationCache.g()[props.index])}
          {tableHead}
          <tbody>
            <For each={
              state.LastOptimizationCache.g()[props.index].etfs.sort(layerSorter).map(toPortfolioRowConverter).map(toTDConverter)
              }>
              {layer => <>{layer}</> }
            </For>
          </tbody>
      </table>      
   }

};




export default PortfolioOptimizerDisplayTable;