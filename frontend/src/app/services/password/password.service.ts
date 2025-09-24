import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combine, split } from 'shamir-secret-sharing';

@Injectable({
    providedIn: 'root'
})
export class PasswordService {

    constructor(
        private http: HttpClient
    ) {
    }

    getAllUserPasswords() {
        return this.http.get('api/v1/password/all/user');
    }

    uploadPassword(body: {}) {
        return this.http.post('api/v1/password', body);
    }

    getPassword(passwordId: any) {
        return this.http.get('api/v1/password/' + passwordId);
    }

    deletePassword(passwordId: any) {
        return this.http.delete('api/v1/password/' + passwordId);
    }

    async reconstructPassword(shards: string[]) {
        const uint8Shards = shards.map(sh => this.base64DecodeUnicode(sh));
        return new TextDecoder().decode(await combine(uint8Shards));
    }

    async getShamirShards(password: string, shardsNo: number) {
        const secret = this.toUint8Array(password);
        const shardsUint8 = await split(secret, shardsNo, Math.floor(shardsNo / 2) + 1);

        return shardsUint8.map(sh => this.base64EncodeUnicode(sh));
    }

    base64EncodeUnicode(utf8Bytes: Uint8Array<ArrayBuffer>): string {
        let binary = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
            binary += String.fromCharCode(utf8Bytes[i]);
        }
        return btoa(binary);
    }

    base64DecodeUnicode(base64: string): Uint8Array<ArrayBuffer> {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    toUint8Array = (data: string) => new TextEncoder().encode(data);

}
