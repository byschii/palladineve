import type { Accessor, Component, Setter } from "solid-js";

type ButtonCheckboxAttrs = {
    label: string,
    valueGetter: Accessor<boolean>
    valueSetter: Setter<boolean>
    isDisabled?: boolean
    otherClasses?: Array<string>
}

const ButtonCheckbox: Component<ButtonCheckboxAttrs> = (props: ButtonCheckboxAttrs) => {

    // init undefined
    if (props.isDisabled === undefined) {
        props.isDisabled = false;
    }
    if (props.otherClasses === undefined) {
        props.otherClasses = [];
    }

    const darkColor = "bg-slate-300"
    const lightColor = "bg-slate-200"

    // init class list
    const whenSelectedClass: string = props.otherClasses.concat(["font-semibold", darkColor]).join(" ");
    const whenNotSelectedClass: string = props.otherClasses.concat(["font-normal", lightColor]).join(" ");


    const toggleCheckboxValue = async (event: Event) => {
        let btn = event.currentTarget as HTMLButtonElement
        const currentCheckboxValue = props.valueGetter()

        btn.className = currentCheckboxValue ? whenSelectedClass : whenNotSelectedClass
        props.valueSetter(!currentCheckboxValue);
    }

    return (
        <button
            class={props.valueGetter() ? whenSelectedClass : whenNotSelectedClass}
            onclick={toggleCheckboxValue}
            disabled={props.isDisabled}
        >
            {props.label}
        </button>
    )
}

export default ButtonCheckbox;
