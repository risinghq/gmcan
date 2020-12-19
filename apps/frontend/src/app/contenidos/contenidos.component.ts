import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AboutUsService } from '../services/aboutus.service';
import { SobreNosotros } from '../models/aboutus';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { CommonService } from '../services/common.service';
import { GLOBAL } from '../services/global';
import { LineasInvestigacionService } from '../services/lineasinvestigacion.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { Languages } from '../models/languages';
import { lineasInvestigacion } from '../models/lineaInvestigacion';
import { MethodsService } from '../services/methods.service';
import { Method } from '../models/method';
import { GrupoService } from '../services/grupo.service';
import { Grupo } from '../models/grupo';
import { EquipoService } from '../services/equipo.service';
import { SoftwareService } from '../services/software.service';
import { Equipo } from '../models/equipo';
import { Software } from '../models/software';

@Component({
  selector: 'app-contenidos',
  templateUrl: './contenidos.component.html',
  styleUrls: ['./contenidos.component.scss']
})
export class ContenidosComponent implements OnInit {
  displayedColumns: string[] = ['nombre'];
  displayedColumns2: string[] = ['nombre'];
  url;
  aboutUs: SobreNosotros;
  public descripcionForm: FormGroup;
  public objetivosForm: FormGroup;
  public serviciosForm: FormGroup;  
  facilidadesRecursosForm: FormGroup;
  trabajosFuturosForm: FormGroup;
  footerForm: FormGroup;
  presentacionForm: FormGroup;
  publicacionesForm: FormGroup;
  proyectosForm: FormGroup;
  lineasInvestigaciones: Array<lineasInvestigacion>;
  dataSource: MatTableDataSource<lineasInvestigacion>;
  dataSource2: MatTableDataSource<Method>;
  dataSource3: MatTableDataSource<Equipo>;
  dataSource4: MatTableDataSource<Software>;
  facilidadesRecursos: Grupo;
  trabajosFuturos: Grupo;
  informacionExtra: Grupo;

  constructor(
    private _aboutService: AboutUsService,
    public formBuilder: FormBuilder,
    public _route: ActivatedRoute,
    public _router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _commonService: CommonService,
    private _lineasInvestigaciónService: LineasInvestigacionService,
    private _metodosService: MethodsService,
    private _grupoService: GrupoService,
    private _equipoService: EquipoService,
    private _softwareService: SoftwareService,
  ) {
    this.aboutUs= new SobreNosotros(null,'','',null,'','','','',null);
    this.facilidadesRecursos=new Grupo(null,'','','','','','','','','','','','','','','','','','','','','','','','',null,null);
    this.trabajosFuturos=new Grupo(null,'','','','','','','','','','','','','','','','','','','','','','','','',null,null);
    this.informacionExtra=new Grupo(null,'','','','','','','','','','','','','','','','','','','','','','','','',null,null);
    this.descripcionForm = this.formBuilder.group({
      quienesSomos: ['', Validators.required],
      quienesSomosEN: ['', Validators.required],
      foto: ['', Validators.required],
    });
    this.objetivosForm = this.formBuilder.group({
      objetivos: ['', Validators.required],
      objetivosEN: ['', Validators.required]
    });
    this.serviciosForm = this.formBuilder.group({
      servicios: ['', Validators.required],
      serviciosEN: ['', Validators.required]
    });
    this.facilidadesRecursosForm = this.formBuilder.group({
      facilidadesRecursos: ['', Validators.required],
      facilidadesRecursosEN: ['', Validators.required],
      facilidadesRecursosFoto: ['', Validators.required],
    });
    this.trabajosFuturosForm = this.formBuilder.group({
      trabajosFuturos: ['', Validators.required],
      trabajosFuturosEN: ['', Validators.required],
    });
    this.trabajosFuturosForm = this.formBuilder.group({
      trabajosFuturos: ['', Validators.required],
      trabajosFuturosEN: ['', Validators.required],
    });
    this.footerForm = this.formBuilder.group({
      correo: ['', Validators.required],
      telefono: ['', Validators.required],
    });
    this.presentacionForm = this.formBuilder.group({
      quienesSomosResumen: ['', Validators.required],
      quienesSomosResumenEN: ['', Validators.required],
    });
    this.publicacionesForm = this.formBuilder.group({
      seccionPublicaciones: ['', Validators.required],
      seccionPublicacionesEN: ['', Validators.required],
    });
    this.proyectosForm = this.formBuilder.group({
      seccionProyectos: ['', Validators.required],
      seccionProyectosEN: ['', Validators.required],
    });
    this.url=GLOBAL.url;
  }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator2: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort2: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator3: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort3: MatSort;

  @ViewChild(MatPaginator, {static: true}) paginator4: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort4: MatSort;

  selectedTab="0";

  ngOnInit() {
    if(sessionStorage.getItem("oldContenidos")!=null){
      this.selectedTab=sessionStorage.getItem("oldContenidos");
    }
    this.getContenidos();
    this.getLineasInvestigación();
    this.getMetodos();
    this.getFacilidadesyRecursos();
    this.getEquipos();
    this.getSoftware();
    this.getTrabajosFuturos();
    this.getInformaciónExtra();
  }

  changedTab(event){
    sessionStorage.setItem("oldContenidos", event);
  }

  getLineasInvestigación(){
    this._lineasInvestigaciónService.getLineasInvestigacion().subscribe((res)=>{
      if(res.length>0){
        res.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre < a.nombre) ? -1 : 0));
        this.lineasInvestigaciones=res;
        this.dataSource = new MatTableDataSource(this.lineasInvestigaciones);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  addLinea(){
    this._router.navigate(['dashboard/add-linea']);
  }

  addMethod(){
    this._router.navigate(['dashboard/add-method']);
  }

  addEquipo(){
    this._router.navigate(['dashboard/add-equipo']);
  }

  addSoftware(){
    this._router.navigate(['dashboard/add-software']);
  }

  editLinea(id){
    this._router.navigate(['dashboard/edit-linea/'+id]);
  }

  editMethod(id){
    this._router.navigate(['dashboard/edit-method/'+id]);
  }

  editEquipo(id){
    this._router.navigate(['dashboard/edit-equipo/'+id]);
  }

  editSoftware(id){
    this._router.navigate(['dashboard/edit-software/'+id]);
  }

  getMetodos(){
    this._metodosService.getMethods().subscribe((res)=>{
      if(res.length>0){
        res.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre < a.nombre) ? -1 : 0));
        this.dataSource2 = new MatTableDataSource(res);
        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      }
    });
  }

  displayedNotFound;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    if(this.dataSource.filteredData.length==0){
      this.displayedNotFound=true;
    }else{
      this.displayedNotFound=false;
    }
  }

  displayedNotFound2;

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
    if(this.dataSource2.filteredData.length==0){
      this.displayedNotFound2=true;
    }else{
      this.displayedNotFound2=false;
    }
  }

  displayedNotFound3;

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    if (this.dataSource3.paginator) {
      this.dataSource3.paginator.firstPage();
    }
    if(this.dataSource3.filteredData.length==0){
      this.displayedNotFound3=true;
    }else{
      this.displayedNotFound3=false;
    }
  }

  displayedNotFound4;

  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    if (this.dataSource4.paginator) {
      this.dataSource4.paginator.firstPage();
    }
    if(this.dataSource.filteredData.length==0){
      this.displayedNotFound4=true;
    }else{
      this.displayedNotFound4=false;
    }
  }

  getFacilidadesyRecursos(){
    this._grupoService.getFacilidadesRecursos().subscribe((res)=>{
      if(res.length>0){
        this.facilidadesRecursos=res[0];
      }
    });
  }

  submitFacilidadesyRecursos(){
    this._grupoService.updateRecursos(this.facilidadesRecursos).subscribe((res)=>{
      if(res.status==1){
        if(this.fileData2){
          this._grupoService.uploadFacilidadesFoto(this.fileData2, this.facilidadesRecursos.idGrupo)
          .subscribe(res => {
          })
        }
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getTrabajosFuturos(){
    this._grupoService.getTrabajosFuturos().subscribe((res)=>{
      if(res.length>0){
        this.trabajosFuturos=res[0];
      }
    });
  }

  submitTrabajosFuturos(){
    this._grupoService.updateTrabajosFuturos(this.trabajosFuturos).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getInformaciónExtra(){
    this._grupoService.getGrupoInfo().subscribe((res)=>{
      if(res.length>0){
        this.informacionExtra=res[0];
      }
    });
  }

  submitSeccionInfo(){
    this._grupoService.updateSeccionInfo(this.informacionExtra).subscribe((res)=>{
      if(res.status==1){
        if(this.fileData3){
          this._grupoService.uploadHeaderLogo(this.fileData3, this.informacionExtra.idGrupo)
          .subscribe(res => {
          })
        }
        if(this.fileData4){
          this._grupoService.uploadFooterLogo(this.fileData4, this.informacionExtra.idGrupo)
          .subscribe(res => {
          })
        }
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionPresentacion(){
    this._grupoService.updateSeccionPresentacion(this.informacionExtra).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionPublicaciones(){
    this._grupoService.updateSeccionPublicaciones(this.informacionExtra).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  submitSeccionProyectos(){
    this._grupoService.updateSeccionProyectos(this.informacionExtra).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Información actualizado exitosamente");
      }
    });
  }

  getEquipos(){
    this._equipoService.getEquipos().subscribe((res)=>{
      if(res.length>0){
        res.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre < a.nombre) ? -1 : 0));
        this.dataSource3 = new MatTableDataSource(res);
        this.dataSource3.sort = this.sort3;
        this.dataSource3.paginator = this.paginator3;
      }
    });
  }

  getSoftware(){
    this._softwareService.getSoftware().subscribe((res)=>{
      if(res.length>0){
        res.sort((a,b) => (a.nombre > b.nombre) ? 1 : ((b.nombre < a.nombre) ? -1 : 0));
        this.dataSource4 = new MatTableDataSource(res);
        this.dataSource4.sort = this.sort4;
        this.dataSource4.paginator = this.paginator4;
      }
    });
  }

  getContenidos(){
    this._aboutService.getAboutUsInfo().subscribe((res)=>{
      if(res.length>0){
        this.aboutUs=res[0];
      }
    });
  }

  submitQuienesSomos(){
    this._aboutService.updateDescripcion(this.aboutUs).subscribe((res)=>{
      if(res.status==1){
        if(this.fileData){
          this._aboutService.uploadGrupoFoto(this.fileData, this.aboutUs.idSobreNosotros)
          .subscribe(res => {
          })
        }
        this.openSnackBar("Contenido actualizado exitosamente");
      }
    });
  }

  submitObjetivos(){
    this._aboutService.updateObjetivos(this.aboutUs).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Contenido actualizado exitosamente");
      }
    });
  }

  submitServicios(){
    this._aboutService.updateServicios(this.aboutUs).subscribe((res)=>{
      if(res.status==1){
        this.openSnackBar("Contenido actualizado exitosamente");
      }
    });
  }

  openSnackBar(value) {
    this._snackBar.open(value, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  fileData: File = null;
  previewUrl:any = null;
  fileData2: File = null;
  previewUrl2:any = null;
  fileData3: File = null;
  previewUrl3:any = null;
  fileData4: File = null;
  previewUrl4:any = null;
  fileProgress(fileInput: any, id) {
    switch (id) {
      case 1:
        this.fileData = <File>fileInput.target.files[0];  
        this.preview(id);
        break;
      case 2:
        this.fileData2 = <File>fileInput.target.files[0];  
        this.preview(id);
        break;
      case 3:
        this.fileData3 = <File>fileInput.target.files[0];  
        this.preview(id);
        break;
      case 4:
        this.fileData4 = <File>fileInput.target.files[0];  
        this.preview(id);
        break;
      default:
        break;
    }
  }

  preview(id) {
    switch (id) {
      case 1:
        var mimeType = this.fileData.type;
        if (mimeType.match(/image\/*/) == null) {
          return;
        }
        var reader = new FileReader();      
        reader.readAsDataURL(this.fileData); 
        reader.onload = (_event) => {
          this.previewUrl = reader.result; 
        } 
        break;
      case 2:
        var mimeType = this.fileData2.type;
        if (mimeType.match(/image\/*/) == null) {
          return;
        }
        var reader = new FileReader();      
        reader.readAsDataURL(this.fileData2); 
        reader.onload = (_event) => {
          this.previewUrl2 = reader.result; 
        }
        break;
      case 3:
        var mimeType = this.fileData3.type;
        if (mimeType.match(/image\/*/) == null) {
          return;
        }
        var reader = new FileReader();      
        reader.readAsDataURL(this.fileData3); 
        reader.onload = (_event) => {
          this.previewUrl3 = reader.result; 
        }
        break;
      case 4:
        var mimeType = this.fileData4.type;
        if (mimeType.match(/image\/*/) == null) {
          return;
        }
        var reader = new FileReader();      
        reader.readAsDataURL(this.fileData4); 
        reader.onload = (_event) => {
          this.previewUrl4 = reader.result; 
        }
        break;
      default:
        break;
    }
  }

  private previewDialog: MatDialogRef<DialogPreview3>

  previewAboutUs(value){
    let aboutus= JSON.parse(JSON.stringify(this.aboutUs));
    localStorage.setItem("langLocale",'0')
    if(value==1){
      aboutus.objetivos=aboutus.objetivosEN;
      aboutus.servicios=aboutus.serviciosEN;
      aboutus.quienesSomos=aboutus.quienesSomosEN;
      localStorage.setItem("langLocale",'1')
    }
    this.previewDialog = this.dialog.open(DialogPreview3,{
      width:'871px',
      id:'previewAboutUs',
      data: aboutus
    });

    this.previewDialog.afterClosed().subscribe(result => {
      if(!result){        
      }
    });
  }

  private previewDialog2: MatDialogRef<DialogPreview6>

  previewTrabajosFuturos(value){
    let aboutus= JSON.parse(JSON.stringify(this.trabajosFuturos));
    localStorage.setItem("langLocale",'0')
    if(value==1){
      aboutus.trabajosFuturos=aboutus.trabajosFuturosEN;
      localStorage.setItem("langLocale",'1')
    }
    this.previewDialog = this.dialog.open(DialogPreview6,{
      width:'871px',
      id:'previewTrabajosFuturos',
      data: aboutus
    });

    this.previewDialog.afterClosed().subscribe(result => {
      if(!result){        
      }
    });
  }

}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/about-us.html',
  styleUrls: ['../about-us/about-us.component.scss'],
})
export class DialogPreview3 {
  url;
  language;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview3>,
    @Inject(MAT_DIALOG_DATA) public aboutus,
    public titlecasePipe:TitleCasePipe,
    public datePipe:DatePipe,) {
      this.url=GLOBAL.url;
    }

    ngOnInit(){
      if(localStorage.getItem('langLocale')=='0'){
        this.language=Languages[0];
      }else{
        this.language=Languages[1];
      }
      document.getElementById("services").innerHTML=this.aboutus.servicios;
      document.getElementById("whoAre").innerHTML=this.aboutus.quienesSomos;
      document.getElementById("objectives").innerHTML=this.aboutus.objetivos;
    }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: '../modals/trabajos-futuros.html',
  styleUrls: ['../works/works.component.scss'],
})
export class DialogPreview6 {
  url;
  language;
  constructor(
    public dialogRef: MatDialogRef<DialogPreview6>,
    @Inject(MAT_DIALOG_DATA) public aboutus,
    public titlecasePipe:TitleCasePipe,
    public datePipe:DatePipe,) {
      this.url=GLOBAL.url;
    }

    ngOnInit(){
      if(localStorage.getItem('langLocale')=='0'){
        this.language=Languages[0];
      }else{
        this.language=Languages[1];
      }
      document.getElementById("works").innerHTML=this.aboutus.trabajosFuturos;
    }
}
