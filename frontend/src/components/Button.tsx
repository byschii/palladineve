import type { Component } from 'solid-js';
import { Link } from "solid-app-router"

const Button: Component<{ displayText: string, linkPath?: string, onClickAction?: ()=>void, expandVertical?:boolean, expandHorizontal?: boolean}> = (props) => {

    let linkPath: string = ""
    if (props.linkPath !== undefined) {
        if (props.linkPath.startsWith("http://") || props.linkPath.startsWith("https://")){
            linkPath = props.linkPath
        }else{
            linkPath = "/" + props.linkPath
        }
    }

    if( props.onClickAction === undefined) {
        props.onClickAction = () => {}
    }


    function titleCaseWord(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1);
    }


    let buttonClass = "bg-blue-200 hover:bg-blue-300 rounded "
    buttonClass += ( props.expandVertical ? "min-h-full" : "" )
    buttonClass += ( props.expandHorizontal ? " min-w-full" : "" )
    

    const asALink = <Link href={linkPath} >
        <button class={buttonClass}>
            <p class="font-medium text-xl px-6"> {titleCaseWord(props.displayText)} </p>
        </button>
    </Link>

    const justButton = <span >
        <button class={buttonClass} onClick={props.onClickAction}>
            <p class="font-medium text-xl px-6"> {titleCaseWord(props.displayText)} </p>
        </button>
    </span>

    return props.linkPath ? asALink : justButton
};

export default Button;