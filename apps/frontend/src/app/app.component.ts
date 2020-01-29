import {Component} from '@angular/core';
import { GrupoService } from './services/grupo.service';
import { GLOBAL } from './services/global';
import { Grupo } from './models/grupo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  screenWidth: number;
  private grupoinfo:Grupo;
  private url;
  constructor(
    private _grupoService: GrupoService,
  ) {
    this.url=GLOBAL.url;
    // set screenWidth on page load
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      // set screenWidth on screen size change
      this.screenWidth = window.innerWidth;
    };

    this.grupoinfo = new Grupo(null,'','','','','','','','','','','','',null,null)
  }

  ngOnInit(){
    this.getGrupoInfo();
  }

  getGrupoInfo(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      this.grupoinfo=res[0];
      this.grupoinfo.logoHeader=this.url+'grupo/get-image-grupo/'+this.grupoinfo.logoHeader;
    });
  }

}


