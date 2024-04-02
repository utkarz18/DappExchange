import { useEffect } from "react";
import sort from '../assets/sort.svg';
import { loadMarketFilledOrders } from "../lib/lib";
import useExchangeTokenStore from "../lib/store";
import Banner from "./Banner";

const Trades = () => {
    const state = useExchangeTokenStore(s => s.state);
    const token1 = state.token1;
    const token2 = state.token2;
    const filledOrders = state.allOrders?.filledOrders;
    const marketFilledOrders = state.marketFilledOrders;

    useEffect(() => {
        (async () => {
            if (token1 && token2 && filledOrders) {
                await loadMarketFilledOrders(filledOrders, token1.contract, token2.contract)
            }
        })();
    }, [token1, token2, filledOrders]);

    return (
        <div className="component exchange__trades">
            <div className='component__header flex-between'>
                <h2>Trades</h2>
            </div>

            {!marketFilledOrders || marketFilledOrders.length === 0 ? (
                <Banner text="No Trades" />
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Time <img src={sort} alt="sort" /></th>
                            <th>{token1 && token1.symbol} <img src={sort} alt="sort" /></th>
                            <th>{token1 && token2 && `${token1.symbol}/${token2.symbol}`} <img src={sort} alt="sort" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketFilledOrders && marketFilledOrders.map((order, index) => (
                            <tr key={index}>
                                <td>{order.formattedTimestamp}</td>
                                <td>{order.type === 'Buy' ? order.amountGet : order.amountGive}</td>
                                <td>{order.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Trades