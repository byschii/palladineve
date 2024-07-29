import { createEffect } from "solid-js";
import { SetStoreFunction, Store, createStore } from "solid-js/store";

// already selected
export function createLocalStore<T extends object>(
    name: string,
    init: T
    ): [Store<T>, SetStoreFunction<T>] {
    const localState = localStorage.getItem(name);
    const [state, setState] = createStore<T>(
        localState ? JSON.parse(localState) : init
    );
    createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
    return [state, setState];
    }
    
export function removeIndex<T>(array: readonly T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

export function GRIDTailwind(rows:number, cols:number, gap:number):string{
    let c = "grid-cols-"+cols;
    let r = "grid-rows-"+rows;
    let g = "gap-"+gap;
    return "grid "+c+" "+r+" "+g;
}