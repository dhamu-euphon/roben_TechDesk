import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { AppGlobals } from '../app.globals';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private _global: AppGlobals, private http: HTTP) { }

  authenticate(username, password) {
    localStorage.setItem('user_id', username);
    return this.http.post(
      this._global.API_URL + '/login/application',
      { client_id: this._global.CLIENT_ID, client_secret: this._global.CLIENT_SECRET, user_id: username, password: password },
      {}
    );
  }

  setSession(data): void {
    const expiresAt = JSON.stringify((data.details.expires_in * 1000) + new Date().getTime());
    localStorage.setItem('access_token', data.details.access_token);
    localStorage.setItem('token_type', data.details.token_type);
    localStorage.setItem('refresh_token', data.details.access_token);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
  }

  public isAuthenticated(): boolean {
    if (navigator.onLine) {
      const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
      return new Date().getTime() < expiresAt;
    }
    return true;
  }

}
