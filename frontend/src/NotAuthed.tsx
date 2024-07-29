import type { Component } from "solid-js";
import ButtonLink from "./components/Button";


const NotAuthed: Component = () => {
    return (
        <div>
            <p> fai <ButtonLink linkPath="login" displayText="login" /></p>
            <p> fai <ButtonLink displayText="register" linkPath="registration" /></p>
        </div>
    )
}

export default NotAuthed;

