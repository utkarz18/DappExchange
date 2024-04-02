import { useEffect } from "react";
import useExchangeTokenStore from "../lib/store";
import { loadMarketFilledOrders } from "../lib/lib";
import sort from '../assets/sort.svg'

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
                            <td>{order.amountGet}</td>
                            <td>{order.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default Trades