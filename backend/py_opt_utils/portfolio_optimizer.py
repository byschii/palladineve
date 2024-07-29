from typing import Dict
import pandas as pd
from pypfopt import risk_models
from pypfopt import expected_returns
from pypfopt.efficient_frontier import EfficientFrontier # https://pyportfolioopt.readthedocs.io/en/latest/EfficientFrontier.html


class PortfolioOptimizer:
    def __init__(self, tickers_dataframe, prefer_recent_data = False, min_weight = 0.01, max_weight = 1):
        if prefer_recent_data:
            mu = expected_returns.ema_historical_return(tickers_dataframe)
            sigma = risk_models.exp_cov(tickers_dataframe)
            sigma = risk_models.fix_nonpositive_semidefinite(sigma)
        else:
            mu = expected_returns.mean_historical_return(tickers_dataframe)
            sigma = risk_models.sample_cov(tickers_dataframe)
            sigma = risk_models.fix_nonpositive_semidefinite(sigma)

        self.mu = mu
        self.sigma = sigma
        self.tickers = tickers_dataframe.columns
        self.min_weight = min_weight
        self.max_weight = max_weight    

    def _init_efficient_frontier(self):
        self.ef = EfficientFrontier(
            self.mu,
            self.sigma,
            weight_bounds=(
                self.min_weight,
                self.max_weight
            )
        )

    def _get_portfolio_stats(self):
        return {
            name: val
            for val,name in zip(
                self.ef.portfolio_performance(risk_free_rate=0.001),
                ['return', 'risk', 'sharpe_ratio']# ['expected return', 'volatility', 'Sharpe ratio']
            )
        }

    def maximum_return(self):
        self._init_efficient_frontier()
        self.ef.max_sharpe(risk_free_rate=0.001)
        weights = self.ef.clean_weights(cutoff=0.001, rounding=4)
        return weights, self._get_portfolio_stats()  

    def minimum_risk(self):
        self._init_efficient_frontier()
        self.ef.min_volatility()
        weights = self.ef.clean_weights(cutoff=0.001, rounding=4)
        return weights, self._get_portfolio_stats()

    def efficient_risk(self, max_target_risk):
        self._init_efficient_frontier()
        self.ef.efficient_risk(max_target_risk)
        weights = self.ef.clean_weights(cutoff=0.001, rounding=4)
        return weights, self._get_portfolio_stats()

    def efficient_return(self, min_target_return):
        self._init_efficient_frontier()
        self.ef.efficient_return(min_target_return)
        weights = self.ef.clean_weights(cutoff=0.001, rounding=4)
        return weights, self._get_portfolio_stats()





def file_to_dataframe(filename, date_column_name="date", price_column_name="adjusted_close" ):
    # convert json file to dataframe
    df = pd.read_json(filename)
    # convert dates in 'date' column
    df[date_column_name] = pd.to_datetime(df[date_column_name], format='%Y-%m-%d')

    # set 'date' column as index
    df.set_index(date_column_name, inplace=True)

    return df[[price_column_name]]


def distribute_money_by_ticker_weights(tickers_weights: Dict[str, float], money:int, tickers_prices: Dict[str, float],):
    """distribute money by weights
    returning for every ticker the amount of money and the amount of shares
    """
    return {
        ticker: (money*weight, money*weight/tickers_prices[ticker])
        for ticker, weight in tickers_weights.items()
    }


