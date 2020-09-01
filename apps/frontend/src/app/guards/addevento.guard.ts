import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AddEventoComponent } from '../add-evento/add-evento.component';

@Injectable()
export class AddEventoGuard implements CanDeactivate<AddEventoComponent> {

  canDeactivate(component: AddEventoComponent) {
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