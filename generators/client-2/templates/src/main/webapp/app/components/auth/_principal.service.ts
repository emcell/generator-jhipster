import { Injectable, Inject } from '@angular/core';
import { Account } from './account.service';

@Injectable()
export class Principal {
    private _identity: any;
    private authenticated: boolean = false;

    constructor(private account: Account<% if (websocket === 'spring-websocket') { %>, @Inject('<%=jhiPrefixCapitalized%>TrackerService') private <%=jhiPrefixCapitalized%>TrackerService<% } %>){}

    authenticate (_identity) {
        this._identity = _identity;
        this.authenticated = _identity !== null;
    }

    hasAnyAuthority (authorities) {
        if (!this.authenticated || !this._identity || !this._identity.authorities) {
            return false;
        }

        for (var i = 0; i < authorities.length; i++) {
            if (this._identity.authorities.indexOf(authorities[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    hasAuthority (authority): Promise<any> {
        if (!this.authenticated) {
           return new Promise((resolve) => resolve(false));
        }

        return this.identity().then(id => {
            return id.authorities && id.authorities.indexOf(authority) !== -1;
        }, () => {
            return false;
        });
    }

    identity (force?: boolean): Promise<any> {
        if (force === true) {
            this._identity = undefined;
        }

        // check and see if we have retrieved the _identity data from the server.
        // if we have, reuse it by immediately resolving
        if (this._identity) {
            return new Promise((resolve) => resolve(this._identity));
        }

        return new Promise((resolve) => {
            // retrieve the _identity data from the server, update the _identity object, and then resolve.
            this.account.get().subscribe(account => {
                if (account) {
                    this._identity = account;
                    this.authenticated = true;
                    resolve(this._identity)
                    <%_ if (websocket === 'spring-websocket') { _%>
                    this.<%=jhiPrefixCapitalized%>TrackerService.connect();
                    <%_ } _%>
                } else {
                    this._identity = null;
                    this.authenticated = false;
                    resolve(this._identity)
                }
            });
        });
    }

    isAuthenticated (): boolean {
        return this.authenticated;
    }

    isIdentityResolved (): boolean {
        return this._identity !== undefined;
    }
}