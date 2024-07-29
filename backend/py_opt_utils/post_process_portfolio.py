from dataclasses import dataclass
import json
from typing import Dict, List
import requests
import pandas as pd
from py_opt_utils import portfolio_optimizer as po

@dataclass(init=False)
class EtfInfo:
    exchange: str
    ticker: str
    isin: str
    percent: float
    last_price: float

    def __init__(self, n, p):
        self.ticker, self.exchange, self.isin = n.split(".")
        self.percent = p

    def get_name(self):
        return f"{self.ticker}.{self.exchange}.{self.isin}"

@dataclass
class RiskLayer:
    etfs: List[EtfInfo]
    risk: float
    expected_return: float
    sharpe_ratio: float



def build_dataframe(eft_filenames, eft_datas, directory = "downloaded_etf" ):
    dfs = [
        (
            f"{data['ticker']}.{data['exchange']}.{data['isin']}",
            po.file_to_dataframe(f"{directory}/{filename}")
        )
        for data, filename
        in zip(eft_datas, eft_filenames)
    ]

    for df in dfs:
        df[1].rename(columns={"adjusted_close": df[0]}, inplace=True)


    return pd.concat([
        df[1]
        for df in dfs
    ], axis=1)


def _convert_porfolio_distribution_to_layer(portfolio) -> RiskLayer:
    etfs = [
        EtfInfo( name, round(perc * 100, 2) )
        for name, perc in portfolio[0].items()
    ]
    return RiskLayer(
        etfs=etfs,
        risk=portfolio[1]['risk'],
        expected_return=portfolio[1]['return'],
        sharpe_ratio=portfolio[1]['sharpe_ratio']
    )


def stratify_portfolio(optimizer: po.PortfolioOptimizer, n=7):

    maxrisk = optimizer.maximum_return()[1]['risk']
    minrisk = optimizer.minimum_risk()[1]['risk']
    if maxrisk is not None and minrisk is not None:
        step = (maxrisk - minrisk) / n
        return [
            _convert_porfolio_distribution_to_layer(
                optimizer.efficient_risk(risk)
            )
            for risk
            in [minrisk + step * i for i in range(n)]
        ]

    return None

def complete_info(layers: List[RiskLayer], last_prices: Dict[str, float]):
    """complete the info of the portfolios
    calculating the number of shares and the money for each etf"""
    for layer in layers:
        for etf in layer.etfs:
            etf.last_price = last_prices[etf.get_name()]

            # shares = money * perc / 100 / last_price


    return layers




