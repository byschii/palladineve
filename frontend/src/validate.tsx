import { stringify } from "postcss";
import { createStore, SetStoreFunction } from "solid-js/store";

type ValidatorList = Array<(param: HTMLInputElement) => string>;
type ErrorStore = { [key: string]: string }; // tag name: error message
type ElementValidatorPair = {
    element: HTMLInputElement,
    validators: ValidatorList
}


// builds a function that check if html-elemnt is ok
function checkValid({ element, validators = [] }: ElementValidatorPair, setErrors: SetStoreFunction<ErrorStore>, errorClass: string) {

    return async () => {
        element.setCustomValidity("");
        element.checkValidity(); // standard from html5 (like minlength = 8)
        if (!element.validationMessage) { // if everythins std is ok
            for (const validator of validators) { // go throught validators given as input
                const text = await validator(element); // anche check if validator redurned a string (meaning error found)
                if (text) {
                    element.setCustomValidity(text); // set sevalidator message as custom validity message
                    break;
                }
            }
        }
        if (element.validationMessage) { // if custom or std validity message is set
            element.classList.toggle(errorClass, true); // toggle error message
            setErrors({ [element.name]: element.validationMessage }); // fill error store with pair "errored element" : "message "
        };
    }
}

// init 3 function to use validation on form
export function useForm({ errorClass }: { errorClass: string }) {
    let [
        errors,
        setErrors
    ] = createStore({} as ErrorStore);

    let fields: ElementValidatorPair[];

    // apply validation on an element
    const validate = (ref: HTMLInputElement, accessor: () => never[]) => {
        const validators: ValidatorList = accessor() || [];
        let config: ElementValidatorPair = { element: ref, validators };
        let tagName = ref.name;

        fields.push(config);

        ref.onblur = checkValid(config, setErrors, errorClass);
        ref.oninput = () => {
            if (errors[tagName]) {
                setErrors({ [ref.name]: undefined });
                ref.classList.toggle(errorClass, false);
            }
        };
    };

    const formSubmit = (ref: HTMLFormElement, callback: () => any) => {
        ref.setAttribute("novalidate", "");
        ref.onsubmit = async (e: SubmitEvent) => {
            e.preventDefault();
            let errored = false;

            for (const k in fields) {
                const field: ElementValidatorPair = fields[k];
                await checkValid(field, setErrors, errorClass)();
                if (!errored && field.element.validationMessage) {
                    field.element.focus();
                    errored = true;
                }
            }
            if (!errored) {
                callback();
            }
        };
    };

    return { validate, formSubmit, errors };
}
