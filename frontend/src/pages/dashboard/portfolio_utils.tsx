import { Etf, PythonResponseLayer } from "src/model/model";
import Pocketbase from 'pocketbase';
import { useAppContext } from "../../AppContext";





export async function dowloadedEftFetcher() : Promise<Etf[]> {
    const state = useAppContext()!;

    const etfs = await fetch(state.host + '/api/etf/available');
    const etfsJson = await etfs.json();
    return etfsJson;
} 

export async function searchDowloadableEftFetcher(isin:string, info: { value: Etf[] | undefined; refetching: boolean | unknown } ): Promise<Etf[]> {
    const state = useAppContext()!;

    console.log("searchDowloadableEftFetcher", state.host)
    const pb = new Pocketbase(state.host);

    if (isin.length < 2) return [];
    const etfs = await fetch(
        pb.baseUrl + '/api/etf/search_by_isin?isin='+isin,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': pb.authStore.token
            }
        }
    );
    const etfsJson = await etfs.json();
    return etfsJson;
}


// info: { value: T | undefined; refetching: boolean | unknown }
// FOR SOME REASON 
// I CANT GET THE STATE INSIDE THE FUNCTION
export async function portfolioOptimizationFetcher(etfs : Etf[], info: { value: PythonResponseLayer[] | undefined; refetching: boolean | unknown } ): Promise<PythonResponseLayer[]> {
    

    if(info.refetching !== undefined && !info.refetching){
        console.log("not refetching")
        // look in db
        return [];
    }
    
    const pb_host = import.meta.env.VITE_PBHOST || "http://localhost:8090";

    const pb = new Pocketbase(pb_host);
    const response = await fetch(
        pb.baseUrl + '/api/portfolio/optimize',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': pb.authStore.token
            },
            body: JSON.stringify({
                etfs: etfs,
                min_weight: 0,
                num_layers: 10,
                prefer_recent_data: false
            }),            
        }
    );

    console.log("got response")
    const responseJson = await response.json();
    return responseJson;
}



