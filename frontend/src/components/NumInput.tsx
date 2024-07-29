import type { Accessor, Component, Setter } from "solid-js";

type BNumInputAttrs = {
    valueGetter: Accessor<number>
    valueSetter: Setter<number>
    placeholder?: string
    isDisabled?: boolean
    otherClasses?: Array<string>
    pattern?: string
}

const NumInput: Component<BNumInputAttrs> = (props: BNumInputAttrs) => {

    // init undefined
    if (props.isDisabled === undefined) {
        props.isDisabled = false;
    }
    if (props.otherClasses === undefined) {
        props.otherClasses = [];
    }

    const classArray: Array<string> = ["bg-slate-200", "text-center"].concat(props.otherClasses)
    let classList: string
    if (props.isDisabled !== true) {
        classList = classArray.concat(["hover:bg-slate-300"]).join(" ");
    } else {
        classList = classArray.join(" ");
    }

    return (
        <input class={classList}
            placeholder={props.placeholder}
            type="number"
            disabled={props.isDisabled}
            value={props.valueGetter()}
            pattern={props.pattern}
            onchange={(e: Event) => {
                props.valueSetter(
                    Number.parseFloat((e.currentTarget! as HTMLInputElement).value)
                )
            }} />
    )
}

export default NumInput;
