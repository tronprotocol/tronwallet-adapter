export function ConnectTip() {
    return (
        <div>
            <strong>Note</strong>
            <ul>
                <li>1. Ledger Firmware versions supported: Nano S: v1.5.5 and above; Nano X: v1.2.4-1 and above</li>
                <li>
                    2. Enable these features before you use them:
                    <ul>
                        <li>2.1 Transaction Data: Enable it to add notes to transfers.</li>
                        <li>2.2 Custom Contracts: Enable it to support smart contract transaction, such as TRC20 transfer.</li>
                        <li>2.3 Sign By Hash: Enable it to edit the account access, i.e. set up multi-signature for the account.</li>
                    </ul>
                </li>
            </ul>
        </div>
    );
}
