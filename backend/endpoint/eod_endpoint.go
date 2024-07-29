package endpoint

/*
https://github.com/sirupsen/logrus
https://github.com/spf13/viper
*/

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"

	eodapi "be/eodapi"
	model "be/model/model"
	u "be/utils"
)

func AddEndpointAvailableEtf(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, dataFolder string) {

	e.Router.AddRoute(echo.Route{
		Method: method,
		Path:   path,
		Handler: func(c echo.Context) error {
			// get the list of downloaded etfs file names
			downloadedEtfList, _ := u.UpdateDownloadedEtfList(dataFolder)
			// create a slice of ETFs
			etfs := make([]model.ETFData, len(downloadedEtfList))
			// iterate over the downloadedEtfList
			for i, downloadedEtfName := range downloadedEtfList {
				etfs[i] = u.FromFilenameToETFData(downloadedEtfName)
			}

			// return the slice as json
			return c.JSON(http.StatusOK, etfs)
		},
		Middlewares: []echo.MiddlewareFunc{
			apis.ActivityLogger(app),
		},
	})
}

func AddEndpointSearchByTickerAndExchange(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, eodhistoricaldataApiKey string) {

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
			// get the ticker and exchange from the query params
			ticker := c.QueryParam("ticker")
			exchange := c.QueryParam("exchange")
			if exchange == "" || ticker == "" {
				return c.String(http.StatusBadRequest, "ticker and exchange are required")
			}
			// search for the etf
			etfs, err := eodapi.SearchEtfByTickerAndExchangeFromApi(ticker, exchange, eodhistoricaldataApiKey)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// return the slice as json
			return c.JSON(200, etfs)
		},
		Middlewares: middlewares,
	})
}

func AddEndpointSearchByIsinAndCountry(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, eodhistoricaldataApiKey string) {

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
			// get the ticker and exchange from the query params
			isin := c.QueryParam("isin")
			country := c.QueryParam("country")
			if isin == "" || country == "" {
				return c.String(http.StatusBadRequest, "isin and country are required")
			}
			// search for the etf
			etfs, err := eodapi.SearchEtfByIsinAndCountryFromApi(isin, country, eodhistoricaldataApiKey)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// return the slice as json
			return c.JSON(200, etfs)
		},
		Middlewares: middlewares,
	})
}

func AddEndpointSearchByIsin(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, eodhistoricaldataApiKey string) {

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
			// get the ticker and exchange from the query params
			isin := c.QueryParam("isin")
			if isin == "" {
				return c.String(http.StatusBadRequest, "isin is required")
			}
			// search for the etf
			etfs, err := eodapi.SearchEtfByIsinFromApi(isin, eodhistoricaldataApiKey)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// return the slice as json
			return c.JSON(200, etfs)
		},
		Middlewares: middlewares,
	})
}

func AddEndpointSearchByName(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, eodhistoricaldataApiKey string) {

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
			// get the ticker and exchange from the query params
			name := c.QueryParam("name")
			if name == "" {
				return c.String(http.StatusBadRequest, "name is required")
			}
			// search for the etf
			etfs, err := eodapi.SearchEtfByNameFromApi(name, eodhistoricaldataApiKey)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// return the slice as json
			return c.JSON(200, etfs)
		},
		Middlewares: middlewares,
	})
}

func AddEndpointDownload(app *pocketbase.PocketBase, e *core.ServeEvent, method string, path string, eodhistoricaldataApiKey string, downloadFolder string) {

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
			// get the ticker and exchange from the query params
			ticker := c.QueryParam("ticker")
			exchange := c.QueryParam("exchange")
			if exchange == "" || ticker == "" {
				return c.String(http.StatusBadRequest, "ticker and exchange are required")
			}
			// search for the etf
			etf, err := eodapi.DownloadEtfFromApi(ticker, exchange, eodhistoricaldataApiKey, downloadFolder)
			if err != nil {
				return c.String(http.StatusInternalServerError, err.Error())
			}
			// return the slice as json
			return c.JSON(200, etf)
		},
		Middlewares: middlewares,
	})
}
