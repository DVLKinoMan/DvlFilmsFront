export class User {
    constructor(
        public userName: string,
        public photo: string,
        private _token: string,
        public TokenExpirationDate: Date,
        private _userRoleId: number
    ) { }

    get token() {
        if (!this.TokenExpirationDate || new Date() > this.TokenExpirationDate)
            return null;
        return this._token;
    }

    get role() {
        if (this._userRoleId == 1)
            return UserRole.Admin;
        return UserRole.User;
    }
}

export enum UserRole {
    User,
    Admin
}
