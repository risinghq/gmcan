import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { EditCategoryComponent } from '../edit-category/edit-category.component';

@Injectable()
export class EditCategoryGuard implements CanDeactivate<EditCategoryComponent> {

  canDeactivate(component: EditCategoryComponent) {
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