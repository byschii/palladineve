package model

// ETF data as they are handled inside the server
type ETFData struct {
	Ticker   string `json:"ticker"`
	Exchange string `json:"exchange"`
	Isin     string `json:"isin"`
	Country  string `json:"country"`
	Name     string `json:"name"`
	DataFrom string `json:"data_from"`
	DataTo   string `json:"data_to"`
}

// main request for the optimization
type OptimizePortfolioRequest struct {
	ETFs             []ETFData `json:"etfs"`
	MinWeight        float64   `json:"min_weight"`
	NumLayers        int       `json:"num_layers"`
	PreferRecentData bool      `json:"prefer_recent_data"`
}
