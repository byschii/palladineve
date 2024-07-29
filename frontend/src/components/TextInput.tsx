import type { Accessor, Component, Setter } from "solid-js";

type BTextInputAttrs = {
    valueGetter: Accessor<string>
    valueSetter: Setter<string>
    type: string
    placeholder?: string
    isDisabled?: boolean
    otherClasses?: Array<string>
    pattern?: string
}

const TextInput: Component<BTextInputAttrs> = (props: BTextInputAttrs) => {

    // init undefined
    if (props.isDisabled === undefined) {
        props.isDisabled = false;
    }
    if (props.otherClasses === undefined) {
        props.otherClasses = [];
    }

    const classArray: Array<string> = ["bg-slate-200"].concat(props.otherClasses)
    let classList: string
    if (props.isDisabled !== true) {
        classList = classArray.concat(["hover:bg-slate-300"]).join(" ");
    } else {
        classList = classArray.join(" ");
    }

    return (
        <input class={classList}
            placeholder={props.placeholder}
            type={props.type}
            disabled={props.isDisabled}
            value={props.valueGetter()}
            pattern={props.pattern}
            onchange={(e: Event) => {
                props.valueSetter((e.currentTarget! as HTMLInputElement).value)
            }} />
    )
}

export default TextInput;
