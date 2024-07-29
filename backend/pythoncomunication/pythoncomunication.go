package pythoncomunication

import (
	model "be/model/model"
	u "be/utils"
	"bytes"
	"encoding/json"

	"net/http"
)

// etf as requested by the pyhon server
// for optimization
type PythonRequestETF struct {
	Ticker   string `json:"ticker"`
	Exchange string `json:"exchange"`
	Isin     string `json:"isin"`
	Filename string `json:"filename"`
}

type PythonRequest struct {
	ETFs             []PythonRequestETF `json:"etfs"`
	MinWeight        float64            `json:"min_weight"`
	NumLayers        int                `json:"num_layers"`
	PreferRecentData bool               `json:"prefer_recent_data"`
}

type PythonResponseETF struct {
	Ticker    string  `json:"ticker"`
	Exchange  string  `json:"exchange"`
	Isin      string  `json:"isin"`
	Percent   float64 `json:"percent"`
	LastPrice float64 `json:"last_price"`
}

type PythonResponseLayer struct {
	ETFs           []PythonResponseETF `json:"etfs"`
	Risk           float64             `json:"risk"`
	ExpectedReturn float64             `json:"expected_return"`
	SharpeRatio    float64             `json:"sharpe_ratio"`
}

type PythonResponse struct {
	Layers []PythonResponseLayer `json:"layers"`
}

func ETFData2PythonRequestETF(etf model.ETFData) PythonRequestETF {
	filename, err := u.FromETFDataToFilename(etf)
	if err != nil {
		panic(err)
	}

	return PythonRequestETF{
		Ticker:   etf.Ticker,
		Exchange: etf.Exchange,
		Isin:     etf.Isin,
		Filename: filename + ".json",
	}
}

func ClientRequestToPythonRequest(clientRequest model.OptimizePortfolioRequest) PythonRequest {
	etfs := make([]PythonRequestETF, len(clientRequest.ETFs))
	for i, etf := range clientRequest.ETFs {
		etfs[i] = ETFData2PythonRequestETF(etf)
	}

	return PythonRequest{
		ETFs:             etfs,
		MinWeight:        clientRequest.MinWeight,
		NumLayers:        clientRequest.NumLayers,
		PreferRecentData: clientRequest.PreferRecentData,
	}
}

func OptimizePortfolioWPython(clientRequest model.OptimizePortfolioRequest, pythonEnpoint string) ([]PythonResponseLayer, error) {
	if clientRequest.ETFs == nil && clientRequest.MinWeight == 0 && clientRequest.NumLayers == 0 && !clientRequest.PreferRecentData {
		return nil, u.WrapError("invalid (empty) request", nil)
	}
	
	pythonRequest := ClientRequestToPythonRequest(clientRequest)

	jsonValue, err := json.Marshal(pythonRequest)
	if err != nil {
		return nil, u.WrapError("Error marshalling python request", err)
	}
	resp, err := http.Post(
		pythonEnpoint,
		"application/json",
		bytes.NewBuffer(jsonValue),
	)
	if err != nil {
		return nil, err
	}

	var pythonResponse PythonResponse
	err = json.NewDecoder(resp.Body).Decode(&pythonResponse)

	if err != nil {
		return nil, u.WrapError("Error decoding python response", err)
	}

	return pythonResponse.Layers, nil

}
