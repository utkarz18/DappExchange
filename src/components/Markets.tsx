import cfg from '../config.json';
import { switchMarket } from '../lib/lib';
import useExchangeTokenStore from '../lib/store';

const Markets = () => {
    const state = useExchangeTokenStore(s => s.state);
    const chainId = state.chainId;
    
    const config = cfg as any;
    const selectedNetwork = chainId ? config[chainId] : null;
    return (
        <div className="component exchange__markets">
            <div className="component__header">
                <h2>Select Market</h2>
            </div>
            {selectedNetwork ? (
            <select name="markets" id="markets" onChange={(event) => switchMarket(event.target.value.split(','))}>
                <option disabled value="0">Select Market</option>
                <option value={`${selectedNetwork.MUSDT},${selectedNetwork.METH}`}>MUSDT/METH</option>
                <option value={`${selectedNetwork.MUSDT},${selectedNetwork.MDAI}`}>MUSDT/MDAI</option>
            </select>
            ) : (
                <div>
                    <p>Markets Not Deployed</p>
                </div>
            )}
            <hr />
        </div>
    )
}

export default Markets