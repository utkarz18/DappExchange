import Blockies from 'react-blockies';
import eth from '../assets/eth.svg';
import logo from '../assets/logo.png';
import cfg from '../config.json';
import { connectWallet, switchNetwork } from '../lib/lib';
import useExchangeTokenStore from '../lib/store';

const Navbar = () => {
    const state = useExchangeTokenStore(s => s.state);
    const account = state.account;
    const chainId = state.chainId;
    const balance = state.accountBalance;

    const config = cfg as any;
    const selectedNetwork = chainId ? config[chainId] : null;

    return (
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <img src={logo} alt='dapp-logo' className='logo'></img>
                <h1>DAAP Token Exchange</h1>
            </div>

            <div className='exchange__header--networks flex'>
                <img src={eth} alt='eth-logo' className='Eth Logo' />
                {chainId && (
                    <select name="networks" id="networks"
                        value={selectedNetwork ? `${chainId}` : '0'}
                        onChange={(event) => switchNetwork(event.target.value)}
                    >
                        <option value="0" disabled>Select Network</option>
                        <option value="31337">Localhost</option>
                        <option value="59140">Goerli</option>
                    </select>
                )}
            </div>

            <div className='exchange__header--account flex'>
                {balance ? (
                    <p><small>Balance: </small>{balance} ETH</p>
                ) : (
                    <p><small>Balance: </small>0 ETH</p>
                )}
                {account ? (
                    <a href={chainId && selectedNetwork.explorerUrl ? `${selectedNetwork.explorerUrl}/address/${account}` : `#`}
                        target={chainId && selectedNetwork.explorerUrl ? '_blank' : ''}
                        rel='noreferrer'
                    >{`${account.slice(0, 6)}....${account.slice(account.length - 4)}`}
                        <Blockies
                            seed={account}
                            size={10}
                            scale={3}
                            color="#2187D0"
                            bgColor="#F1F2F9"
                            spotColor="#767F92"
                        /></a>
                ) : (
                    <button className='button' onClick={() => connectWallet()}>Connect</button>
                )}
            </div>
        </div>
    )
}

export default Navbar