import { useEffect, useState } from "react";
import sort from '../assets/sort.svg';
import { cancelOrder, loadUserOrders } from "../lib/lib";
import useExchangeTokenStore from "../lib/store";
import Banner from "./Banner";

const Transactions = () => {
    const state = useExchangeTokenStore(s => s.state);
    const account = state.account;
    const token1 = state.token1;
    const token2 = state.token2;
    const exchange = state.exchange;
    const marketOpenOrders = state.marketOpenOrders;
    const marketFilledOrders = state.marketFilledOrders;
    const userOpenOrders = state.allUserOrders?.openOrders;
    const userfilledOrders = state.allUserOrders?.filledOrders;

    const [isShowOrder, setIsShowOrder] = useState(true);

    useEffect(() => {
        (async () => {
            if (account) {
                await loadUserOrders({
                    openOrders: marketOpenOrders,
                    filledOrders: marketFilledOrders
                }, account)
            }
        })();
    }, [account, token2, marketOpenOrders, marketFilledOrders]);


    return (
        <div className="component exchange__transactions">
            <div>
                <div className='component__header flex-between'>
                    {isShowOrder ? (
                        <h2>My Orders</h2>
                    ) : (
                        <h2>My Transactions</h2>
                    )}

                    <div className='tabs'>
                        <button className={isShowOrder ? 'tab tab--active' : 'tab'} onClick={() => setIsShowOrder(true)}>Orders</button>
                        <button className={!isShowOrder ? 'tab tab--active' : 'tab'} onClick={() => setIsShowOrder(false)}>Trades</button>
                    </div>
                </div>

                {isShowOrder && (!userOpenOrders || userOpenOrders.length === 0 ? (
                    <Banner text="No Open Orders" />
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>{token1?.symbol}</th>
                                <th>{`${token1?.symbol}/${token2?.symbol}`}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {userOpenOrders && userOpenOrders.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.type === 'Buy' ? order.amountGet : order.amountGive}</td>
                                    <td>{order.price}</td>
                                    <td><button className="button--sm" onClick={async() => await cancelOrder(exchange?.contract, order.id)}>Cancel</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}

                {!isShowOrder && (!userfilledOrders || userfilledOrders.length === 0 ? (
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
                            {userfilledOrders && userfilledOrders.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.formattedTimestamp}</td>
                                    <td style={order.signerAddress === account ?
                                        { color: "#25CE8F" } : { color: "#F45353" }}
                                    >
                                        {order.signerAddress === account ? '+' : '-'}
                                        {order.type === 'Buy' ? order.amountGet : order.amountGive}
                                    </td>
                                    <td>{order.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </div>
        </div>
    )
}

export default Transactions