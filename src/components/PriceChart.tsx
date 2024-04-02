import useExchangeTokenStore from "../lib/store";
import Banner from "./Banner";
import Chart from 'react-apexcharts'
import { options, series } from './PriceChart.config'

const PriceChart = () => {
    const state = useExchangeTokenStore(s => s.state);
    const account = state.account;
    const token1 = state.token1;
    const token2 = state.token2;

    return (
        <div className="component exchange__chart">
            <div className='component__header flex-between'>
                <div className='flex'>

                    <h2>{token1 && token2 && `${token1.symbol}/${token2.symbol}`}</h2>

                    <div className='flex'>
                        {/* <img src="" alt="Arrow down" /> */}
                        <span className='up'></span>
                    </div>

                </div>
            </div>

            {/* Price chart goes here */}
            {!account ? (
                <Banner text="Please Connect Wallet" />
            ) : (
                <Chart
                    type="candlestick"
                    options={options}
                    series={series}
                    width="100%"
                    height="100%" />
            )}

        </div>
    );
}

export default PriceChart