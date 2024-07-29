package eodapi

import (
	"be/model/model"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	u "be/utils"
)

// ETF data as they are returned by the official eodhistoricaldata.com API
type ETFResponse struct {
	Code     string `json:"Code"`
	Exchange string `json:"Exchange"`
	Name     string `json:"Name"`
	Type     string `json:"Type"`
	Country  string `json:"Country"`
	Currency string `json:"Currency"`
	ISIN     string `json:"ISIN"`
}

// ETF values data as they are returned by the official eodhistoricaldata.com API
type DailyData struct {
	Date          string  `json:"date"`
	Open          float64 `json:"open"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Close         float64 `json:"close"`
	AdjustedClose float64 `json:"adjusted_close"`
	Volume        int64   `json:"volume"`
}

func SearchEtfByNameFromApi(name string, token string) ([]model.ETFData, error) {
	searh_url := fmt.Sprintf("https://eodhistoricaldata.com/api/search/%s?api_token=%s&type=etf", name, token)
	resp, err := http.Get(searh_url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse body to json
	var etfs []ETFResponse
	err = json.Unmarshal(body, &etfs)
	if err != nil {
		return nil, err
	}

	// convert to ETF filter by country
	etfsConverted := make([]model.ETFData, 0)
	for _, etf := range etfs {
		if etf.Name != "" {
			etfToAdd := model.ETFData{
				Ticker:   etf.Code,
				Exchange: etf.Exchange,
				Isin:     etf.ISIN,
				Country:  strings.ToLower(etf.Country),
				Name:     etf.Name,
			}
			etfsConverted = append(etfsConverted, etfToAdd)
		}
	}

	return etfsConverted, nil
}

func SearchEtfByIsinFromApi(isin string, token string) ([]model.ETFData, error) {
	searh_url := fmt.Sprintf("https://eodhistoricaldata.com/api/search/%s?api_token=%s&type=etf", isin, token)
	resp, err := http.Get(searh_url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse body to json
	var etfs []ETFResponse
	err = json.Unmarshal(body, &etfs)
	if err != nil {
		return nil, err
	}

	etfs_converted := make([]model.ETFData, 0)
	for _, etf := range etfs {
		if etf.ISIN != "" {
			etfToAdd := model.ETFData{
				Ticker:   etf.Code,
				Exchange: etf.Exchange,
				Isin:     etf.ISIN,
				Country:  strings.ToLower(etf.Country),
				Name:     etf.Name,
			}
			etfs_converted = append(etfs_converted, etfToAdd)
		}
	}

	return etfs_converted, nil
}

func SearchEtfByIsinAndCountryFromApi(isin string, country string, token string) ([]model.ETFData, error) {
	searh_url := fmt.Sprintf("https://eodhistoricaldata.com/api/search/%s?api_token=%s&type=etf", isin, token)
	resp, err := http.Get(searh_url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse body to json
	var etfs []ETFResponse
	err = json.Unmarshal(body, &etfs)
	if err != nil {
		return nil, err
	}

	// convert to ETF filter by country
	etfsConverted := make([]model.ETFData, 0)
	for _, etf := range etfs {
		validIsinAndCurrency := etf.ISIN != "" && strings.EqualFold(etf.Currency, "EUR")
		if strings.EqualFold(etf.Country, country) && validIsinAndCurrency {
			currentEtf := model.ETFData{
				Ticker:   etf.Code,
				Exchange: etf.Exchange,
				Isin:     etf.ISIN,
				Country:  strings.ToLower(etf.Country),
				Name:     etf.Name,
			}
			etfsConverted = append(etfsConverted, currentEtf)
		}
	}

	return etfsConverted, nil
}

func SearchEtfByTickerAndExchangeFromApi(ticker string, exchange string, token string) ([]model.ETFData, error) {
	searh_url := fmt.Sprintf("https://eodhistoricaldata.com/api/search/%s.%s?api_token=%s&type=etf", ticker, exchange, token)
	resp, err := http.Get(searh_url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse body to json
	var etfs []ETFResponse
	err = json.Unmarshal(body, &etfs)
	if err != nil {
		return nil, err
	}

	// convert to ETF
	etfsConverted := make([]model.ETFData, 0)
	for _, etf := range etfs {
		if etf.Code != "" && etf.Exchange != "" {
			etfToAdd := model.ETFData{
				Ticker:   etf.Code,
				Exchange: etf.Exchange,
				Isin:     etf.ISIN,
				Country:  strings.ToLower(etf.Country),
				Name:     etf.Name,
			}
			etfsConverted = append(etfsConverted, etfToAdd)
		}
	}

	return etfsConverted, nil
}

func DownloadEtfFromApi(ticker string, exchange string, token string, destinationFolder string) (*model.ETFData, error) {
	/*
		DOC: https://eodhistoricaldata.com/financial-apis/api-for-historical-data-and-volumes/
		fmt – the output format. Possible values are ‘csv’ for CSV output and ‘json’ for JSON output. Default value: ‘csv’.
		period – use ‘d’ for daily, ‘w’ for weekly, ‘m’ for monthly prices. By default, daily prices will be shown.
		order – use ‘a’ for ascending dates (from old to new), ‘d’ for descending dates (from new to old). By default, dates are shown in ascending order.
		from and to – the format is ‘YYYY-MM-DD’. If you need data from Jan 5, 2017, to Feb 10, 2017, you should use from=2017-01-05 and to=2017-02-10.
	*/
	ric := fmt.Sprintf("%s.%s", ticker, exchange)
	fmtParam := "fmt=json"
	periodParam := "period=d"
	orderParam := "order=d"
	fromParam := "from=2010-01-01"
	// most recent date
	toParam := "to=" + u.GetTodayDate()
	downloadUrl := "https://eodhistoricaldata.com/api/eod/%s?api_token=%s&%s&%s&%s&%s&%s"
	downloadUrl = fmt.Sprintf(downloadUrl, ric, token, periodParam, orderParam, fromParam, toParam, fmtParam)

	resp, err := http.Get(downloadUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// parse body to json
	var dailyData []DailyData
	err = json.Unmarshal(body, &dailyData)
	if err != nil {
		return nil, u.WrapError("error while parsing json ("+string(body)+")", err)
	}

	// get info on etf
	etfInfo, err := SearchEtfByTickerAndExchangeFromApi(ticker, exchange, token)
	if err != nil {
		return nil, err
	}
	etfInfo[0].DataFrom = dailyData[len(dailyData)-1].Date
	etfInfo[0].DataTo = dailyData[0].Date
	dataFileName, err := u.FromETFDataToFilename(etfInfo[0])
	if err != nil {
		return nil, err
	}

	// create a json file
	file, err := os.Create(destinationFolder + "/" + dataFileName + ".json")
	if err != nil {
		return nil, err
	}
	defer file.Close()
	// write data to file
	_, err = file.Write(body)
	if err != nil {
		return nil, err
	}

	// remove older data
	_, err = u.DeleteEtfFile(etfInfo[0].Name, etfInfo[0].Ticker, etfInfo[0].Exchange, destinationFolder, dataFileName+".json")
	if err != nil {
		return nil, err
	}

	return &etfInfo[0], nil
}
