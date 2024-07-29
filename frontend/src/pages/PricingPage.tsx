import type { Component } from 'solid-js';
import Button from '../components/Button';
import { useAppContext } from '../AppContext';




const PricingPage: Component = () => {
  
  const state = useAppContext()!;
  const userId = state.CurrentUserData?.g()!.id;

  const getPaymentOptionElement = (
    paymentOptionName: string,
    features: Array<string>,
    callToAction:string,
    link:string,
    price?: number,
    ) => {


    // create a span with the payment option name
    // aligned to the center with tailwind
    const paymentOptionElementName = <span class="text-2xl py-8 font-bold m-auto flex justify-center">
      <p>{paymentOptionName}</p>
    </span>

    // create a list of features
    const paymentOptionElementFeatures = features.map((feature) => {
      return <li class="text-center">{feature}</li>
    })



    // create call to action button
    const callToActionButton = <span class="flex justify-center py-8">
      <p class="text-center text-xl font-bold mx-4">{price==undefined ? 'Free' : '€'+price}</p>
      <Button displayText={callToAction} linkPath={link} />
    </span>

    return (
      <div class="bg-white mt-1 mb-2 mx-1 rounded self-center">
        <div class="grid grid-rows-3">
          <div>{paymentOptionElementName}</div>
          <ul class="py-8">
            {paymentOptionElementFeatures}
          </ul>
            {callToActionButton}
        </div>
      </div>
    )}
  
  
  const buttonBasic = getPaymentOptionElement(
    'Basic', ['1', '2', '3'], 'Sign up', 'registration'
  )

  const buttonPremium = getPaymentOptionElement(
    'Premium', ['nulla', 'di', 'che'], 'Try for free', 'http://localhost:8090/api/payment/init?u='+userId, 5
    )
  
  return (
    <div class="grid grid-cols-4 h-1/2" >
      <div></div>
      {buttonBasic}
      {buttonPremium}
      <div></div>
    </div>
  );
};

export default PricingPage;