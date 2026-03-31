import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {GLOBAL} from './global';

@Injectable({
	providedIn: 'root'
  })
export class RevistaService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

	constructor(public http: HttpClient){
		this.url = GLOBAL.url;
    }
    
    getRevistas(): any{
        let headers = new HttpHeaders ({
			'Content-Type':'application/json'
		});
        return this.http.get(this.url+'revista/get-revista',{headers:headers});
    }

    getRevista(idRevista):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.get(this.url+'revista/get-revista/'+idRevista,{headers:headers});
    }

    addRevista(revista):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.post(this.url+'revista/post-revista/',revista,{headers:headers});
    }

    updateRevista(revista):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.put(this.url+'revista/update-revista/', revista,{headers:headers});
    }

    deleteRevista(idRevista):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.delete(this.url+'revista/delete-revista/'+idRevista,{headers:headers});
    }
}
