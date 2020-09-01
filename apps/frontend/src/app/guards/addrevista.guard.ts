import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AddRevistaComponent } from '../add-revista/add-revista.component';

@Injectable()
export class AddRevistaGuard implements CanDeactivate<AddRevistaComponent> {

  canDeactivate(component: AddRevistaComponent) {
    let sessionEnd;
    if(localStorage.getItem("sessionEnd")=='1'){
      localStorage.setItem("sessionEnd",'0');
      sessionEnd = true;
    }else{
        sessionEnd = false;
    }
    if(!component.agregar && !sessionEnd){
        return component.canDeactivate();
    }else{
        return true;
    }
  }
}