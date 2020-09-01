import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditTesisComponent } from '../edit-tesis/edit-tesis.component';

@Injectable()
export class EditTesisGuard implements CanDeactivate<EditTesisComponent> {

  canDeactivate(component: EditTesisComponent) {
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