package main

import (
	"crypto/rand"
	"log"
	"net/http"
	"os"
	"time"

	otherendpoint "be/endpoint"
	_ "be/migrations"
	dbmodeluser "be/model/user"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models/settings"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/stripe/stripe-go/v74"
)

// return a 15 character long random string
func RandomID() string {
	const alphanum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	const length = 15
	var bytes = make([]byte, length)
	rand.Read(bytes)
	for i, b := range bytes {
		bytes[i] = alphanum[b%byte(len(alphanum))]
	}
	return string(bytes)
}

func setResponseACAOHeaderFromRequest(req http.Request, resp echo.Response) {
	resp.Header().Set(echo.HeaderAccessControlAllowOrigin,
		req.Header.Get(echo.HeaderOrigin))
}

func ACAOHeaderOverwriteMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		ctx.Response().Before(func() {
			setResponseACAOHeaderFromRequest(*ctx.Request(), *ctx.Response())
		})
		return next(ctx)
	}
}

func main() {
	STRIPE_KEY := ""
	EOD_HISTORICAL_DATA_API_KEY := "."
	STRIPE_PRICE_ID := ""
	ETF_DOWNLOAD_FOLDER := "./downloaded_etf"
	PYTHON_OPTIMIZATION_LINK := "http://127.0.0.1:8000/optimize"
	STRIPE_INIT_ENDPOINT := "/api/payment/init"
	FRONTEND_FOLDER := "pb_public"
	DATE_TIME_FORMAT := "2006-01-02 15:04:05.000Z"
	APP_URL := "http://127.0.0.1:8090"
	if os.Getenv("RUNNING") == "PUBLIC" {
		APP_URL = "http://admin.palladineve.com"
	}

	rebuildDB := false
	stripe.Key = STRIPE_KEY
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		Automigrate: true, // auto creates migration files when making collection changes
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// SETUP SERVER
		// static files from the provided public dir (if exists)
		subFs := echo.MustSubFS(e.Router.Filesystem, FRONTEND_FOLDER)
		e.Router.GET("/*", apis.StaticDirectoryHandler(subFs, false))

		// create ETF_DOWNLOAD_FOLDER if not exists
		if _, err := os.Stat(ETF_DOWNLOAD_FOLDER); os.IsNotExist(err) {
			os.Mkdir(ETF_DOWNLOAD_FOLDER, 0755)
		}

		// SETUP ROUTES
		otherendpoint.AddEndpointSubscribeToPayment(
			app, e, http.MethodGet, STRIPE_INIT_ENDPOINT, STRIPE_PRICE_ID,
		)

		otherendpoint.AddEndpointPaymentWebhook(
			app, e, http.MethodPost, "/api/payment/webhook",
		)

		otherendpoint.AddEndpointAvailableEtf(
			app, e, http.MethodGet, "/api/etf/available",
			ETF_DOWNLOAD_FOLDER,
		)

		otherendpoint.AddEndpointSearchByTickerAndExchange(
			app, e, http.MethodGet, "/api/etf/search_by_ticker_and_exchange",
			EOD_HISTORICAL_DATA_API_KEY,
		)

		otherendpoint.AddEndpointSearchByIsinAndCountry(
			app, e, http.MethodGet, "/api/etf/search_by_isin_and_country",
			EOD_HISTORICAL_DATA_API_KEY,
		)

		otherendpoint.AddEndpointSearchByIsin(
			app, e, http.MethodGet, "/api/etf/search_by_isin",
			EOD_HISTORICAL_DATA_API_KEY,
		)

		otherendpoint.AddEndpointSearchByName(
			app, e, http.MethodGet, "/api/etf/search_by_name",
			EOD_HISTORICAL_DATA_API_KEY,
		)

		otherendpoint.AddEndpointDownload(
			app, e, http.MethodGet, "/api/etf/download",
			EOD_HISTORICAL_DATA_API_KEY,
			ETF_DOWNLOAD_FOLDER,
		)

		otherendpoint.AddEndpointOptimizePortfolio(
			app, e, http.MethodPost, "/api/portfolio/optimize",
			EOD_HISTORICAL_DATA_API_KEY, ETF_DOWNLOAD_FOLDER, PYTHON_OPTIMIZATION_LINK, STRIPE_INIT_ENDPOINT, STRIPE_PRICE_ID,
		)

		//SETUP DATABASE
		if rebuildDB {
			dbmodeluser.InitUserCollections(app)
		}

		// SETUP CONFIG
		// set application url
		app.Settings().Meta.AppUrl = APP_URL

		// set application smtp
		app.Settings().Smtp = settings.SmtpConfig{
			Enabled:  true,
			Host:     "mail.smtp2go.com",
			Port:     587,
			Username: "byschii",          // me@byschii.com
			Password: "2CRgwjNNLFlIWPpc", // DobbiacoSMTP2G
		}

		// set application email
		app.Settings().Meta.AppName = "palladineve"
		app.Settings().Meta.SenderName = "Support"
		app.Settings().Meta.SenderAddress = "support@byschiitest.com"

		return nil
	})

	app.OnRecordAfterCreateRequest().Add(func(e *core.RecordCreateEvent) error {
		collectionName := e.Record.Collection().Name
		if collectionName == "users" {
			log.Print("creating user")

			// get record (user) id and time with milliseconds
			rightNow := time.Now().Format(DATE_TIME_FORMAT)
			userID := e.Record.Id

			detailsError := dbmodeluser.StoreNewUserDetails(app.Dao(), userID)
			importantError := dbmodeluser.StoreNewUserImportantData(app.Dao(), userID)

			if detailsError != nil || importantError != nil {
				log.Print("error creating user details or important data")
				log.Println(detailsError)
				log.Println(importantError)
			}

			log.Print("userID: ", userID, " rightNow: ", rightNow)
		}

		return nil
	})

	app.OnRecordBeforeUpdateRequest().Add(func(e *core.RecordUpdateEvent) error {
		collectionName := e.Record.Collection().Name
		if collectionName == "user_important_data" {
			log.Print("editing user_important_data")
		}

		return nil
	})

	err := app.Start()
	if err != nil {
		log.Fatal(err)
	}

}
