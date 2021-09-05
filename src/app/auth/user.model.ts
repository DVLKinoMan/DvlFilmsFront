export class User {
    constructor(
        public userName: string,
        public photo: string,
        private _token: string,
        public TokenExpirationDate: Date
    ) { }

    get token() {
        if (!this.TokenExpirationDate || new Date() > this.TokenExpirationDate)
            return null;
        return this._token;
    }
}
