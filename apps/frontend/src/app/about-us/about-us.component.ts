import { Component, OnInit } from '@angular/core';
import { AboutUsService } from '../services/aboutus.service';
import { SobreNosotros } from '../models/aboutus';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  language;

  aboutus:SobreNosotros;

  constructor(
    public aboutusService: AboutUsService
  ) {
    this.aboutus=new SobreNosotros(null,"","","","","",null,null)
   }

  ngOnInit() {
    this.language=JSON.parse(localStorage.getItem("language"));
    this.getAboutUs();
  }

  getAboutUs(){
    this.aboutusService.getAboutUsInfo().subscribe((res)=>{
      this.aboutus=res[0];
      document.getElementById("services").innerHTML=this.aboutus.servicios;
      document.getElementById("whoAre").innerHTML=this.aboutus.quienesSomos;
      document.getElementById("objectives").innerHTML=this.aboutus.objetivos;
    });
  }

}
