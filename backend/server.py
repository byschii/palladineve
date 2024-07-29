from typing import Dict, List
import fastapi
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import pydantic
from py_opt_utils import portfolio_optimizer, post_process_portfolio
import uvicorn
from pandas import DataFrame

app = fastapi.FastAPI()

# define etf input
class ETFin(pydantic.BaseModel):
    ticker: str
    isin: str
    exchange: str
    filename: str

# define etf output
class ETFOut(pydantic.BaseModel):
    ticker: str
    isin: str
    exchange: str
    percent: float
    last_price: float

class GoRequest(pydantic.BaseModel):
    etfs: List[ETFin]
    prefer_recent_data: bool
    min_weight: float
    num_layers: int

class LayerOut(pydantic.BaseModel):
    etfs: List[ETFOut]
    risk: float # volatility
    expected_return: float
    sharpe_ratio: float

class GoResponse(pydantic.BaseModel):
    layers: List[LayerOut]




def EtfInfo2ETFOut(etf_info: post_process_portfolio.EtfInfo) -> ETFOut:
    return ETFOut(
        ticker=etf_info.ticker,
        isin=etf_info.isin,
        exchange=etf_info.exchange,
        percent=etf_info.percent,
        last_price=etf_info.last_price
    )


def RiskLayer2LayerOut(risk_layer: post_process_portfolio.RiskLayer) -> LayerOut:
    return LayerOut(
        etfs=[
            EtfInfo2ETFOut(etf_info)
            for etf_info in risk_layer.etfs
        ],
        risk=risk_layer.risk,
        expected_return=risk_layer.expected_return,
        sharpe_ratio=risk_layer.sharpe_ratio
    )

def get_last_prices(df: DataFrame) -> Dict[str, float]:
    """creates a dict of pairs (ticker, last price)
    sometimes the last price is NaN, 
    so it s necessary to go to previous prices until a price is found"""
    last_prices = {}
    for ticker in df.columns:
        lp = df[ticker].iloc[-1]
        # check if is nan
        if lp != lp:
            # go to previous prices until a price is found
            for i in range(2, len(df[ticker])):
                lp = df[ticker].iloc[-i]
                if lp == lp:
                    break
        last_prices[ticker] = lp


    return last_prices


def go_optimize(go_request: GoRequest) -> GoResponse:
    etf_datas = [
        {
            "ticker": etf.ticker,
            "exchange": etf.exchange,
            "isin": etf.isin
        }
        for etf in go_request.etfs
    ]

    etf_filenames = [
        etf.filename
        for etf in go_request.etfs
    ]

    df = post_process_portfolio.build_dataframe(etf_filenames, etf_datas)

    optimizer = portfolio_optimizer.PortfolioOptimizer(
        df,
        prefer_recent_data=go_request.prefer_recent_data,
        min_weight=go_request.min_weight
    )

    partial_stratified = post_process_portfolio.stratify_portfolio(
        optimizer, 
        go_request.num_layers
    )

    if partial_stratified is not None and len(partial_stratified) > 0:
        last_prices = get_last_prices(df)

        full_stratified = post_process_portfolio.complete_info(
            partial_stratified, last_prices
        )

        return GoResponse(
            layers=[
                    RiskLayer2LayerOut(risk_layer)
                    for risk_layer in full_stratified
            ]
        )
    else:
        # log input
        raise Exception("error optimizing portfolio")



@app.post("/optimize", response_model=GoResponse)
async def optimize(request: Request):
    # get request body
    request_body = await request.json()
    # parse request body
    go_request = GoRequest(**request_body)
    # call go function
    try:
        go_response = go_optimize(go_request)
        return JSONResponse(
            status_code=200,
            content=go_response.dict()
        )
    except Exception as e:
        # print exception and line
        print(e)
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )
    

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)