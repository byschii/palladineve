import type { Component } from 'solid-js';
import Button from '../components/Button';
import { useAppContext } from '../AppContext';

import step1 from '../assets/howto/step-1.png';
import step2 from '../assets/howto/step-2.png';
import step3 from '../assets/howto/step-3.png';
import step4 from '../assets/howto/step-4.png';
import step5 from '../assets/howto/step-5.png';
import step6 from '../assets/howto/step-6.png';



const HowToPage: Component = () => {
  const stepClasses = "text-3xl font-bold justify-self-center";
  const stepBorder = "  w-full py-4"
  const imageClasses = "justify-self-center object-scale-down h-full"
  const descriptionClasses = "justify-self-center text-xl font-bold "

  return (
    <div class="m-2 p-2 rounded-lg bg-white" >
      <div class={"grid grid-cols-1 justify-self-center " + stepBorder}>
        <div class={stepClasses}>Step 0</div>
        <div class={descriptionClasses}>Create an account and Enter dashboard</div>
      </div>

      <div class={"grid grid-cols-2 justify-self-center " + stepBorder}>
        <div class={stepClasses + " col-span-2"}>Step 1</div>
        <div class={descriptionClasses + " col-span-2"}>
          Pick you favourite ETFs from the sections you will find</div>
        <img src={step1} alt="step1" class={imageClasses} />
        <img src={step2} alt="step2" class={imageClasses} />
      </div>

      <div class={"grid grid-cols-2 justify-self-center " + stepBorder}>
        <div class={stepClasses + " col-span-2"}>Step 3</div>
        <div class={descriptionClasses + " col-span-2"}>Review the ETFs and run the optimization</div>
        <img src={step3} alt="step3" class={imageClasses} />
        <img src={step4} alt="step4" class={imageClasses} />
      </div>

      <div class={"grid grid-cols-2 justify-self-center " + stepBorder}>
        <div class={stepClasses + " col-span-2"}>Step 4</div>
        <div class={descriptionClasses + " col-span-2"}>Play with Money + Risk levels and check results</div>
        <div class= " my-4 mx-8 col-span-2"><img src={step5} alt="step5" class={imageClasses} /></div>
        <div class= " my-4 mx-8 col-span-2"><img src={step6} alt="step6" class={imageClasses} /></div>
      </div>
    </div>
  );
};

export default HowToPage;