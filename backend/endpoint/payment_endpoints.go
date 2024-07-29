package endpoint

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	dbmodeluser "be/model/user"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/checkout/session"
	"github.com/stripe/stripe-go/v74/subscription"
	"github.com/stripe/stripe-go/v74/subscriptionitem"
	"github.com/stripe/stripe-go/v74/webhook"
)

// https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=checkout&integration=checkout#customer-portal
// https://stripe.com/docs/payments/checkout/fulfill-orders
// https://www.youtube.com/watch?v=MbqSMgMAzxU
// https://stripe.com/docs/payments/checkout/fulfill-orders
/*
chiamato dal client quando finisce
le quote gratis
*/
func AddEndpointSubscribeToPayment(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, stripePriceId string) error {

	middlewares := []echo.MiddlewareFunc{
		apis.ActivityLogger(app),
	}
	if !app.IsDebug() {
		middlewares = append(
			middlewares,
			apis.LoadAuthContext(app),
			apis.RequireAdminOrRecordAuth(),
		)
	}

	e.Router.AddRoute(echo.Route{
		Method: method,
		Path:   path,
		Handler: func(c echo.Context) error {

			// retrive user id from get params
			record, _ := c.Get("authRecord").(*models.Record)
			// host
			pocketBaseEndpoint := c.Request().Host
			// metadata to recover user id
			userMetaData := map[string]string{
				"userId": record.Id,
			}

			checkoutSessionParams := &stripe.CheckoutSessionParams{
				Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
				SuccessURL: stripe.String(string("http://" + pocketBaseEndpoint + "/settings?session_id={CHECKOUT_SESSION_ID}")),
				CancelURL:  stripe.String(string("http://" + pocketBaseEndpoint + "/stripe-error")),
				SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
					Metadata: userMetaData,
				},
				LineItems: []*stripe.CheckoutSessionLineItemParams{
					{
						Price: stripe.String(stripePriceId),
					},
				},
			}

			checkoutSession, err := session.New(checkoutSessionParams)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}

			fmt.Println("checkoutSession.URL = ", checkoutSession.URL)

			return c.Redirect(http.StatusSeeOther, checkoutSession.URL)
		},
		Middlewares: middlewares,
	})

	return nil
}

// https://dashboard.stripe.com/test/webhooks
/*
chiamato da stripe quando finisce il pagamento
*/
func AddEndpointPaymentWebhook(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string) error {
	e.Router.AddRoute(echo.Route{
		Method: method,
		Path:   path,
		Handler: func(c echo.Context) error {
			// reading the body of the request
			const MaxBodyBytes = int64(65536)
			reqBody := http.MaxBytesReader(c.Response().Writer, c.Request().Body, MaxBodyBytes)
			defer reqBody.Close()
			body, err := io.ReadAll(reqBody)
			if err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			endpointSecret := "whsec_8e74901737bd1049fcbfaef4a4ec8fa91245e2215ec5c36cebdcbe2075dbe690"
			// Pass the request body and Stripe-Signature header to ConstructEvent, along
			// with the webhook signing key.
			event, err := webhook.ConstructEvent(body, c.Request().Header.Get("Stripe-Signature"), endpointSecret)

			if err != nil {
				fmt.Fprintf(os.Stderr, "Error verifying webhook signature: %v\n", err)
				return c.String(http.StatusBadRequest, err.Error())
			}

			// Unmarshal the event data into an appropriate struct depending on its Type
			switch event.Type {
			case "checkout.session.completed":
				// now you can use the app
				var checkoutSession stripe.CheckoutSession
				err := json.Unmarshal(event.Data.Raw, &checkoutSession)
				if err != nil {
					return c.String(http.StatusBadRequest, err.Error())
				}

				go func() {
					// save subscription id
					subscriptionData, _ := subscription.Get(checkoutSession.Subscription.ID, nil)
					metadata := subscriptionData.Metadata
					userId := metadata["userId"]

					dbmodeluser.NewUserSubscription(
						app.Dao(),
						userId,
						checkoutSession.Subscription.ID,
						checkoutSession.Customer.ID,
					)
					log.Printf("save sub %s and id %s for user %s", checkoutSession.Subscription.ID, checkoutSession.Customer.ID, subscriptionData.Metadata["userId"])

				}()

				return c.String(http.StatusOK, "ty")

			case "payment_intent.payment_failed":
				return c.String(http.StatusOK, "failed subscription")

			case "invoice.payment_succeeded":
				return c.String(http.StatusOK, "la tua carta funziona")

			case "invoice.payment_failed":
				return c.String(http.StatusOK, "la tua carta non funziona")

			default:
				fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
				return c.String(http.StatusBadRequest, "Unhandled event type")
			}

		},
	})
	return nil
}

func AddUsage(stripePriceId string, stripeSubscriptionId string) (*stripe.SubscriptionItem, error) {
	params := &stripe.SubscriptionItemParams{
		Price:        stripe.String(stripePriceId),
		Quantity:     stripe.Int64(1),
		Subscription: stripe.String(stripeSubscriptionId),
	}
	return subscriptionitem.New(params)
}
