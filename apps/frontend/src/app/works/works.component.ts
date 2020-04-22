import { Component, OnInit } from '@angular/core';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo';

@Component({
  selector: 'app-works',
  templateUrl: './works.component.html',
  styleUrls: ['./works.component.scss']
})
export class WorksComponent implements OnInit {
  public info:Grupo;
  language;
  constructor(
    public _grupoService: GrupoService,
  ) { 
    this.info = new Grupo(null,'','','','','','','','','','','','','','',null,null)
  }

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.getGrupoInfo();
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.info=res[0];
      document.getElementById("works").innerHTML=this.info.trabajosFuturos;
    });
  }

}
