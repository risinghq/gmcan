import { Component, OnInit } from '@angular/core';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private info:Grupo;

  constructor(
    private _grupoService: GrupoService,
  ) {
    this.info= new Grupo(null,'','','','','','','','','','','','',null,null);
  }

  ngOnInit() {
    this.getGrupoInfo();
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.info=res[0];
    });
  }

}
