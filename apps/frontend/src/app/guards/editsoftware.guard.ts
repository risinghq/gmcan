import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditSoftwareComponent } from '../edit-software/edit-software.component';

@Injectable()
export class EditSoftwareGuard implements CanDeactivate<EditSoftwareComponent> {

  canDeactivate(component: EditSoftwareComponent) {
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