import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AddTesisComponent } from '../add-tesis/add-tesis.component';

@Injectable()
export class AddTesisGuard implements CanDeactivate<AddTesisComponent> {

  canDeactivate(component: AddTesisComponent) {
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