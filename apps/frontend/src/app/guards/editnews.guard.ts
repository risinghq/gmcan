import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditNewsComponent } from '../edit-news/edit-news.component';

@Injectable()
export class EditNewsGuard implements CanDeactivate<EditNewsComponent> {

  canDeactivate(component: EditNewsComponent) {
    let sessionEnd;
    if(localStorage.getItem("sessionEnd")=='1'){
        localStorage.setItem("sessionEnd",'0');
        sessionEnd = true;
    }else{
        sessionEnd=false;
    }
    if(!component.agregar && !sessionEnd){
        return component.canDeactivate();
    }else{
        return true;
    }
  }
}