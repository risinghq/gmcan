import { NgModule, Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Routes, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Grupo } from '../models/grupo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GrupoService } from '../services/grupo.service';
import { SessionService } from '../services/session.service';
import { Languages } from '../models/languages';
import { GLOBAL } from '../services/global';
import { Location } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  screenWidth: number;
  public  grupoinfo:Grupo;
  public  url;
  enteredButton = false;
  isMatMenuOpen = false;
  prevButtonTrigger;
  language;
  public searchGlobalForm:FormGroup;
  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    private ren: Renderer2,
    public  _grupoService: GrupoService,
    private session: SessionService,
    public fb:FormBuilder,   
    public location: Location, 
  ) {
    this.searchGlobalForm = this.fb.group({
      nombre: ['']
    });
    this.language = Languages[this.lanSelected];
    if(JSON.parse(localStorage.getItem("lanId"))){
      this.language = Languages[JSON.parse(localStorage.getItem("lanId"))];
      this.lanSelected= JSON.parse(localStorage.getItem("lanId"));
    }
    this.url=GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    this.grupoinfo = new Grupo(null,'','','','','','','','','','','','','','',null,null)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(){
    this.getGrupoInfo();
    localStorage.setItem("language", JSON.stringify(this.language));
    this.verifyLocale(JSON.parse(localStorage.getItem("language")));
  }

  lanSelected=0;

  verifyLocale(language){
    if(language.locale=="en"){
      this.english()
    }else{
      this.spanish()
    }
  }

  english() {
    this.session.registerCulture('en-en');
  }

  spanish() {
    this.session.registerCulture('es-es');
  }

  lanSelect(number){
    this.lanSelected=number;
    this.verifyLocale(this.language);
    localStorage.setItem("language", JSON.stringify(this.language));
    localStorage.setItem("lanId",JSON.stringify(number));
    window.location.reload();
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.grupoinfo=res[0];
      localStorage.setItem("grupoInfo",JSON.stringify(this.grupoinfo));
      this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
    });
  }
  inputExpand=false;
  expandInput(){
    this.inputExpand=!this.inputExpand;
    if(this.inputExpand){
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-decompressed");
      document.getElementById("formExpand").setAttribute("class", "full-width");
    }else{
      document.getElementById("inputExpand").setAttribute("class", "search-top-input search-top-input-compressed");
      document.getElementById("formExpand").setAttribute("class", "");
    }
  }

  /* globalSearch */

  searchGlobal(value){
    this._router.navigate(['/home/search/'+value]);
  }

  loginLink(){
    sessionStorage.setItem("previous-page", this.location.path().slice(1));
    this._router.navigate(['/login']);
  }
}
