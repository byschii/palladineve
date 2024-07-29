package endpoint

/*
https://github.com/sirupsen/logrus
https://github.com/spf13/viper
*/

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/daos"
	"github.com/pocketbase/pocketbase/models"

	eodapi "be/eodapi"
	model "be/model/model"
	users "be/model/user"
	pycom "be/pythoncomunication"
	u "be/utils"
)

func AddEndpointOptimizePortfolio(app *pocketbase.PocketBase, e *core.ServeEvent,
	method string, path string,
	eodhistoricaldataApiKey string, downloadFolder string, pythonLink string, initPaymentLink string, optimizationPriceId string) {

	middlewares := []echo.MiddlewareFunc{
		apis.ActivityLogger(app),
	}
	if app.IsDebug() {
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

			// get user making request
			record, _ := c.Get("authRecord").(*models.Record)
			if record == nil {
				return c.String(http.StatusUnauthorized, "unauthorized")
			}

			// read the request body as json
			request := model.OptimizePortfolioRequest{}
			if err := c.Bind(&request); err != nil {
				return c.String(http.StatusBadRequest, "invalid valid json: "+err.Error())
			}

			// handle EVENTUAL not downloaded etfs
			filledRequest, err := HandleDataDownload(&request, record.Id, eodhistoricaldataApiKey, downloadFolder, app.Dao())
			if err != nil {
				return c.String(http.StatusInternalServerError, "error downloading data: "+err.Error())
			}

			// call STRIPE
			// get number of optimizations
			// if num = 0
			// redirect to stripe payment initialization
			// dont consume quota, dont save optimization and dont let user continue (etfs are saved in localstorage)
			stripeRef := "-"
			/*importantData, err := users.GetuUserImportantData(app.Dao(), record.Id)
			if err != nil {
				log.Print(err.Error() + " - error getting user's important data")
				return c.String(http.StatusInternalServerError, "error getting user's important data: "+err.Error())
			}
			if importantData.FreeOptimizations == 0 {
				return c.Redirect(http.StatusTemporaryRedirect, initPaymentLink)
			}
			if importantData.FreeOptimizations < 0 {
				si, err := AddUsage(optimizationPriceId, importantData.StripeSubscriptionId)
				if err != nil {
					return c.String(http.StatusInternalServerError, "error adding usage: "+err.Error())
				}
				stripeRef = si.ID
			}*/

			// optimize
			stratifiedOptimizedPortfolio, err := HandlePortfloioOptimization(*filledRequest, record.Id, pythonLink, stripeRef, app.Dao())
			if err != nil {
				return c.String(http.StatusInternalServerError, "error optimizing portfolio: "+err.Error())
			}

			// sleep a bit to simulate a long computation
			//abit := 0.1 + rand.Float32()
			// time.Sleep(time.Duration(abit * float32(time.Second)))

			return c.JSON(http.StatusOK, stratifiedOptimizedPortfolio)
		},
		Middlewares: middlewares,
	})
}

func HandleDataDownload(request *model.OptimizePortfolioRequest, userId string, eodhistoricaldataApiKey string, downloadFolder string, dao *daos.Dao) (*model.OptimizePortfolioRequest, error) {
	// go throught all etfs required
	for i, etf := range request.ETFs {
		// check if etf not already downloaded
		if etf.DataFrom == "" || etf.DataTo == "" {
			// download etf
			downloadedEtfInfo, err := eodapi.DownloadEtfFromApi(etf.Ticker, etf.Exchange, eodhistoricaldataApiKey, downloadFolder)
			if err != nil {
				return nil, u.WrapError(" error downloading etf", err)
			}

			// add call to stripe for payment
			// TODO
			stripeRef := "TODO"

			// register activity
			actInput, _ := json.Marshal(etf)
			actOutput, _ := json.Marshal(downloadedEtfInfo)
			users.SaveActivity(dao, users.UserActivity{
				RelatedUser:    userId,
				StripeRef:      stripeRef,
				ActivityType:   users.AvailableActivityUpdateEtf,
				ActivityInput:  actInput,
				ActivityOutput: actOutput,
			})

			// fill info in return
			request.ETFs[i].DataFrom = downloadedEtfInfo.DataFrom
			request.ETFs[i].DataTo = downloadedEtfInfo.DataTo
		}
	}
	return request, nil
}

func HandlePortfloioOptimization(requestedEtfs model.OptimizePortfolioRequest, userId string, pythonLink string, stripeRef string, dao *daos.Dao) ([]pycom.PythonResponseLayer, error) {
	stratifiedOptimizedPortfolio, err := pycom.OptimizePortfolioWPython(requestedEtfs, pythonLink)
	if err != nil {
		return nil, u.WrapError(" error calling python optimizer ", err)
	}

	// consume the user's quota
	updErr := users.ConsumeOptimization(dao, userId)
	if updErr != nil {
		log.Print(updErr.Error() + " - error consuming user's quota")
		return nil, u.WrapError(" error consuming user's quota ", updErr)
	}

	// save user last optimization in his details table
	cacheOptErr := users.SaveOptimizationResult(dao, userId, stratifiedOptimizedPortfolio)
	if cacheOptErr != nil {
		log.Print(cacheOptErr.Error() + " - error caching optimization")
		return nil, u.WrapError(" error caching optimization ", cacheOptErr)
	}

	// register activity
	actInput, _ := json.Marshal(requestedEtfs)
	users.SaveActivity(dao, users.UserActivity{
		RelatedUser:   userId,
		StripeRef:     stripeRef,
		ActivityType:  users.AvailableActivityOptimization,
		ActivityInput: actInput,
	})

	return stratifiedOptimizedPortfolio, nil
}
