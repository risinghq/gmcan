import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditFuenteComponent } from '../edit-fuente/edit-fuente.component';

@Injectable()
export class EditFuenteGuard implements CanDeactivate<EditFuenteComponent> {

  canDeactivate(component: EditFuenteComponent) {
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