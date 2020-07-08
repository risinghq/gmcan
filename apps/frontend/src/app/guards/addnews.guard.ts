import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AddNewsComponent } from '../add-news/add-news.component';

@Injectable()
export class AddNewsGuard implements CanDeactivate<AddNewsComponent> {

  canDeactivate(component: AddNewsComponent) {
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