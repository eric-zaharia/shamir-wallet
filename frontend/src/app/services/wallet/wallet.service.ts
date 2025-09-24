import { Injectable } from '@angular/core';
import { Account, Address, Mnemonic, TestnetEntrypoint, ApiNetworkProvider } from '@multiversx/sdk-core/out';
import * as CryptoJS from 'crypto-js';
import { Transaction } from '../../model/transaction';

@Injectable({
    providedIn: 'root',
})
export class WalletService {
    private entrypoint: TestnetEntrypoint;
    private controller;
    private account?: Account;

    constructor() {
        this.entrypoint = new TestnetEntrypoint();
        this.controller = this.entrypoint.createTransfersController();
    }

    async getTransactions(): Promise<Transaction[]> {
        const api = this.entrypoint.createNetworkProvider();
        if (this.account) {
            const url = `accounts/${this.account.address.toBech32()}/transactions`;
            return await api.doGetGeneric(url).then((result: any[]) => {
                return result.map(entry => {
                    const incoming = entry.sender !== this.account?.address.toBech32();
                    let address: string;
                    if (incoming) {
                        address = entry.sender;
                    } else {
                        address = entry.receiver;
                    }
                    return {
                        incoming: incoming,
                        address: address,
                        txHash: entry.txHash,
                        timestamp: (new Date(entry.timestamp * 1000)).toLocaleString(),
                        amount: (Number(entry.value) / Number(1000000000000000000n)).toString(),
                    }
                });
            });
        }

        return [];
    }

    async getEgldBalance(): Promise<string> {
        const api = this.entrypoint.createNetworkProvider();
        if (this.account) {
            const accountOnNetwork = await api.getAccount(this.account.address);
            const balance = Number(accountOnNetwork.balance) / Number(1000000000000000000n);
            return balance.toString();
        }

        return '0';
    }

    getMnemonic() {
        return Mnemonic.generate().toString();
    }

    removeWalletData() {
        localStorage.removeItem("encryptedMnemonic");
        sessionStorage.removeItem("decryptedWallet");

        return null;
    }

    restoreWallet(userPassword: string) {
        const storedData = sessionStorage.getItem('decryptedWallet');
        if (storedData) {
            const { mnemonicString } = JSON.parse(storedData);
            this.account = Account.newFromMnemonic(mnemonicString);
            return this.account;
        }

        const encryptedMnemonic = localStorage.getItem('encryptedMnemonic');
        if (encryptedMnemonic == null) {
            return null;
        }

        if (!userPassword) {
            return null;
        }

        const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, userPassword);
        const mnemonicString = bytes.toString(CryptoJS.enc.Utf8);

        if (!mnemonicString) {
            return null;
        }

        this.account = Account.newFromMnemonic(mnemonicString);
        sessionStorage.setItem('decryptedWallet', JSON.stringify({ mnemonicString }));
        return this.account;
    }

    generateWallet(mnemonicString: string, userPassword: string) {
        if (sessionStorage.getItem('decryptedWallet') != null) {
            sessionStorage.removeItem('decryptedWallet');
        }

        this.account = Account.newFromMnemonic(mnemonicString);

        const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonicString, userPassword).toString();

        localStorage.setItem('encryptedMnemonic', encryptedMnemonic);

        return this.account;
    }

    async sendTransaction(destination: string, amount: number) {
        if (this.account) {
            const destinationAddress = Address.newFromBech32(destination);

            this.account.nonce = await this.entrypoint.recallAccountNonce(this.account.address);

            let computedAmount = amount * Number(1000000000000000000n);

            const transaction = await this.controller.createTransactionForNativeTokenTransfer(
                this.account,
                this.account.getNonceThenIncrement(),
                {
                    receiver: destinationAddress,
                    nativeAmount: BigInt(computedAmount),
                }
            );

            const txHash = await this.entrypoint.sendTransaction(transaction);
        }
    }

    async simulateTransactionCost(destination: string, amount: number) {
        if (this.account) {
            const api = this.entrypoint.createNetworkProvider();
            const destinationAddress = Address.newFromBech32(destination);

            this.account.nonce = await this.entrypoint.recallAccountNonce(this.account.address);

            let computedAmount = amount * Number(1000000000000000000n);

            const transaction = await this.controller.createTransactionForNativeTokenTransfer(
                this.account,
                this.account.getNonceThenIncrement(),
                {
                    receiver: destinationAddress,
                    nativeAmount: BigInt(computedAmount),
                }
            );

            const tx = await api.simulateTransaction(transaction);
            return (Number(tx.gasPrice) * Number(tx.gasLimit) / Number(1000000000000000000n)).toString();
        }

        return '0';
    }

}
