import { useEffect, useRef } from "react";
import useExchangeTokenStore from "../lib/store";
import { resetAlerts } from "../lib/lib";

const Alert = () => {
    const state = useExchangeTokenStore(s => s.state);
    const account = state.account;
    const isTransactionPending = state.isTransactionPending;
    const isTransactionError = state.isTransactionError;
    const isTransactionSuccessfull = state.isTransactionSuccessfull
    const transactionHash = state.transactionHash;

    const alertRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ((isTransactionPending || isTransactionError || isTransactionSuccessfull)
            && account) {
            alertRef.current!.className = 'alert';
            setTimeout(() => {
                dismissAlert();
            }, 5000)
        }

    }, [isTransactionPending, isTransactionPending, isTransactionSuccessfull, account])

    const dismissAlert = () => {
        resetAlerts();
        alertRef.current ? alertRef.current.className = 'alert-remove' : {};
    }

    return (
        <div>
            {isTransactionPending && <div ref={alertRef} onClick={() => dismissAlert()}>
                <h1>Transaction Pending...</h1>
            </div>}
            {isTransactionError && <div ref={alertRef} onClick={() => dismissAlert()}>
                <h1>Transaction Will Fail</h1>
            </div>}
            {isTransactionSuccessfull && <div ref={alertRef} onClick={() => dismissAlert()}>
                <h1>Transaction Successful</h1>
                <a
                    href=''
                    target='_blank'
                    rel='noreferrer'
                >
                {transactionHash && `${transactionHash.slice(0, 6)}....${transactionHash.slice(transactionHash.length - 4)}`}
                </a>
            </div>
            }
            <div ref={alertRef}></div>
        </div>
    );
}

export default Alert;