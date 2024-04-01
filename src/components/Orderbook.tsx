import useExchangeTokenStore from "../lib/store";
import sort from '../assets/sort.svg'
import { useEffect } from "react";
import { loadOrderBook } from "../lib/lib";

const Orderbook = () => {
    const state = useExchangeTokenStore(s => s.state);
    const token1 = state.token1;
    const token2 = state.token2;
    const allOrders = state.allOrders;
    const orderbook = state.orderBook;

    useEffect(() => {
        (async () => {
            if (token1 && token2 && allOrders && allOrders.openOrders) {
                await loadOrderBook(allOrders.openOrders, token1.contract, token2.contract)
            }
        })();
    }, [token1, token2, allOrders?.openOrders])

    return (
        <div className="component exchange__orderbook">
            <div className='component__header flex-between'>
                <h2>Order Book</h2>
            </div>

            <div className="flex">
                {!orderbook || orderbook.sellOrders?.length === 0 ? (
                    <p className="flex-center">No Sell Orders</p>
                ) : (
                    <table className='exchange__orderbook--sell'>
                        <caption>Selling</caption>
                        <thead>
                            <tr>
                                <th>{token1?.symbol}<img src={sort} alt="Sort" /></th>
                                <th>{token1?.symbol}/{token2?.symbol}<img src={sort} alt="Sort" /></th>
                                <th>{token2?.symbol}<img src={sort} alt="Sort" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderbook.sellOrders?.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.amountGive}</td>
                                    <td style={{color: "#F45353"}}>{order.price}</td>
                                    <td>{order.amountGet}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className='divider'></div>

                {!orderbook || orderbook.buyOrders?.length === 0 ? (
                    <p className="flex-center">No Buy Orders</p>
                ) : (
                    <table className='exchange__orderbook--buy'>
                        <caption>Buying</caption>
                        <thead>
                            <tr>
                                <th>{token1?.symbol}<img src={sort} alt="Sort" /></th>
                                <th>{token1?.symbol}/{token2?.symbol}<img src={sort} alt="Sort" /></th>
                                <th>{token2?.symbol}<img src={sort} alt="Sort" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderbook.buyOrders?.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.amountGet}</td>
                                    <td style={{color: "#25CE8F"}}>{order.price}</td>
                                    <td>{order.amountGive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Orderbook