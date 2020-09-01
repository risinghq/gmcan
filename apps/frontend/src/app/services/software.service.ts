import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {GLOBAL} from './global';
import { stringify } from 'querystring';

@Injectable({
	providedIn: 'root'
  })
export class SoftwareService{
    public url: string;
    JWT_TOKEN = 'JWT_TOKEN';

	languagelocal;
    constructor(public http: HttpClient){
      this.url = GLOBAL.url;
      this.languagelocal=JSON.parse(localStorage.getItem("language")).locale;
    }
    
    getSoftware(): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      if(this.languagelocal=="es"){
        return this.http.get(this.url+'software/get-software',{headers:headers});
      }else{
        return this.http.get(this.url+'software/get-software-en',{headers:headers});
      }
    }

    getSoftwareId(idSoftware): any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json'
      });
      return this.http.get(this.url+'software/get-software/'+idSoftware,{headers:headers});
    }

    addSoftware(software):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.post(this.url+'software/post-software/',software,{headers:headers});
    }
  
    updateSoftware(software):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.put(this.url+'software/update-software/',software,{headers:headers});
    }
  
    deleteSoftware(idSoftware):any{
      let headers = new HttpHeaders ({
        'Content-Type':'application/json',
        'Authorization': 'Bearer '+ localStorage.getItem(this.JWT_TOKEN)
      });
      return this.http.delete(this.url+'software/delete-software/'+idSoftware,{headers:headers});
    }
}