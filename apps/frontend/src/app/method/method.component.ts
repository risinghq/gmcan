import { Component, OnInit } from '@angular/core';
import { MethodsService } from '../services/methods.service';
import { Method } from '../models/method';
import { GLOBAL } from '../services/global';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-method',
  templateUrl: './method.component.html',
  styleUrls: ['./method.component.scss']
})
export class MethodComponent implements OnInit {

  language;
  url;

  methods: Array<Method>;

  constructor(
    public _methodService: MethodsService,
    private titleService: Title,
  ) {
    this.url=GLOBAL.url
   }

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.titleService.setTitle('GMCAN | '+this.language.methods);
    this.getMethods();
  }  

  ngAfterViewChecked(){
    if(this.methods){
      for (let index = 0; index < this.methods.length; index++) {
        document.getElementById("descripcion"+index).innerHTML=this.methods[index].descripcion;
      } 
    }
  }

  getMethods(){
    this._methodService.getMethods().subscribe((res)=>{
      this.methods=res;
    });
  }

}
