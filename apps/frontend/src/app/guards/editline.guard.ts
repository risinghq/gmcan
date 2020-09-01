import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditLineaComponent } from '../edit-linea/edit-linea.component';

@Injectable()
export class EditLineGuard implements CanDeactivate<EditLineaComponent> {

  canDeactivate(component: EditLineaComponent) {
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