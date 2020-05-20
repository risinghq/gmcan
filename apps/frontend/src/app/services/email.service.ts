import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class EmailService{
    public url: string;

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    sendEmail(user): any{
      let body = JSON.stringify(user);
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.post(this.url+'email/send-email',body,{headers:headers});
    }

    recoverEmail(user): any{
      let body = JSON.stringify(user);
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.post(this.url+'email/reset-password-email ',body,{headers:headers});
    }

}