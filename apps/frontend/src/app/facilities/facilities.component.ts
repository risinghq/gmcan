import { Component, OnInit } from '@angular/core';
import { EquipoService } from '../services/equipo.service';
import { SoftwareService } from '../services/software.service';
import { Equipo } from '../models/equipo';
import { Software } from '../models/software';

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.scss']
})
export class FacilitiesComponent implements OnInit {
  equipos: Array<Equipo>;
  software: Array<Software>;

  public page1;
  public pageSize;

  public page2;  

  constructor(
    public _equipoService: EquipoService,
    public _softwareService: SoftwareService
  ) {

  }

  language;

  ngOnInit() {
    this.equipos=[];
    this.software=[];
    this.language=JSON.parse(localStorage.getItem("language"));
    this.page1 = 1;
    this.page2 = 1;
    this.pageSize = 5;
    this.getEquipos();
    this.getSoftware();
  }

  getEquipos(){
    this._equipoService.getEquipos().subscribe((res)=>{
      this.equipos=res;
    });
  }

  getSoftware(){
    this._softwareService.getSoftware().subscribe((res)=>{
      this.software=res;
    });
  }

}
