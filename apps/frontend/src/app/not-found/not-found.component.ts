import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  button_text;
  dashboard;
  constructor(
    public _router: Router,
  ) { }

  language;
  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.setTexts()
  }

  setTexts(){
    if(window.location.href.includes('dashboard')){
      this.button_text="Volver al dashboard";
      this.dashboard=true;
    }else{
      this.button_text=this.language.notFoundBtn;
    }
  }

  navigate(){
    if(this.dashboard){
      this._router.navigate(['/dashboard']);
    }else{
      this._router.navigate(['/']);
    }
  }

}
