import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
  })
export class CommonService{
    public url: string;

    languagelocal;
    constructor(){}

    defineTitle(value){
        let splitted=value.split('ews/',2);
        switch (value) {
            case '/dashboard':
                return '<span>Dashboard</span>'
            case '/dashboard/noticias':
                return '<span>Noticias</span>'
            case '/dashboard/add-news':
                return '<span>Noticias </span><span class="grey-title">- Agregar Noticia</span>'
            case '/dashboard/add-category':
                return '<span>Noticias </span><span class="grey-title">- Agregar Categoría</span>'
            case '/dashboard/miembros-activos':
                return '<span>Miembros Activos</span>'
            case '/dashboard/miembros-antiguos':
                return '<span>Miembros Antiguos</span>'
            case '/dashboard/add-member':
                return '<span>Miembros Activos </span><span class="grey-title">- Agregar miembro al grupo</span>'
            case '/dashboard/perfil':
                return '<span>Mi información personal</span>'
            case '/dashboard/articulos':
                return '<span>Artículos</span>'
            case '/dashboard/tesis':
                return '<span>Tesis</span>'
            case '/dashboard/eventos':
                return '<span>Resúmenes en eventos</span>'
            case '/dashboard/add-revista':
                return '<span>Artículos </span><span class="grey-title">- Agregar revista</span>'
            case '/dashboard/add-universidad':
                return '<span>Tesis </span><span class="grey-title">- Agregar universidad</span>'
            case '/dashboard/add-evento':
                return '<span>Resúmenes en eventos </span><span class="grey-title">- Agregar evento</span>'
            case '/dashboard/add-article':
                return '<span>Artículo </span><span class="grey-title">- Agregar artículo</span>'
            case '/dashboard/add-thesis':
                return '<span>Tesis </span><span class="grey-title">- Agregar tesis</span>'
            case '/dashboard/add-resumen':
                return '<span>Resúmenes en eventos </span><span class="grey-title">- Agregar resumen</span>'
            case '/dashboard/my-articles':
                return '<span>Mis artículos</span>'
            case '/dashboard/my-thesis':
                return '<span>Mis tesis</span>'
            case '/dashboard/my-abstracts':
                return '<span>Mis resúmenes en eventos</span>'
            case '/dashboard/add-fuente':
                return '<span>Proyectos en ejecución </span><span class="grey-title">- Agregar fuente de financiamiento</span>'
            case '/dashboard/proyectos-ejecucion':
                return '<span>Proyectos en ejecución</span>'
            case '/dashboard/add-project':
                return '<span>Proyectos en ejecución </span><span class="grey-title">- Agregar proyecto</span>'
            case '/dashboard/proyectos-concluidos':
                return '<span>Proyectos concluidos</span>'
            case '/dashboard/contenidos':
                return '<span>Contenidos</span>'
            case '/dashboard/add-linea':
                return '<span>Contenidos</span><span class="grey-title">- Agregar línea</span>'
            case '/dashboard/add-method':
                return '<span>Contenidos</span><span class="grey-title">- Agregar método</span>'
            case '/dashboard/add-equipo':
                return '<span>Contenidos</span><span class="grey-title">- Agregar equipo</span>'
            case '/dashboard/add-software':
                return '<span>Software </span><span class="grey-title">- Agregar software</span>'
            default:
                break;
        }
        if(splitted[0]=='/dashboard/edit-n'){
            return '<span>Noticias </span><span class="grey-title">- Detalle de Noticia</span>';
        }
        splitted=value.split('member/',2);
        if(splitted[0]=='/dashboard/edit-'){
            if(localStorage.getItem("miembroEdit")){
                if(localStorage.getItem("active-member")=='1'){
                    return '<span>Miembros Activos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("miembroEdit"))+'</span>';
                }else{
                    return '<span>Miembros Antiguos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("miembroEdit"))+'</span>';
                }
            }            
        }
        splitted=value.split('gory/',2);
        if(splitted[0]=='/dashboard/edit-cate'){
            return '<span>Noticias </span><span class="grey-title">- Categoria: '+JSON.parse(localStorage.getItem("categoryEdit"))+'</span>';
        }
        splitted=value.split('vista/',2);
        if(splitted[0]=='/dashboard/edit-re'){
            return '<span>Artículos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("revistaEdit"))+'</span>';
        }
        splitted=value.split('versidad/',2);
        if(splitted[0]=='/dashboard/edit-uni'){
            return '<span>Tesis </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("universidadEdit"))+'</span>';
        }
        splitted=value.split('ento/',2);
        if(splitted[0]=='/dashboard/edit-ev'){
            return '<span>Resúmenes de eventos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("eventoEdit"))+'</span>';
        }
        splitted=value.split('ticle/',2);
        if(splitted[0]=='/dashboard/edit-ar'){
            return '<span>Artículos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("articleEdit"))+'</span>';
        }
        splitted=value.split('hesis/',2);
        if(splitted[0]=='/dashboard/edit-t'){
            return '<span>Tesis </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("thesisEdit"))+'</span>';
        }
        splitted=value.split('sumen/',2);
        if(splitted[0]=='/dashboard/edit-re'){
            return '<span>Resúmenes de eventos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("resumenEdit"))+'</span>';
        }
        splitted=value.split('ente/',2);
        if(splitted[0]=='/dashboard/edit-fu'){
            return '<span>Proyectos en ejecución </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("fuenteEdit"))+'</span>';
        }
        splitted=value.split('ente/',2);
        if(splitted[0]=='/dashboard/edit-fu'){
            return '<span>Proyectos en ejecución </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("fuenteEdit"))+'</span>';
        }
        splitted=value.split('inea/',2);
        if(splitted[0]=='/dashboard/edit-l'){
            return '<span>Contenidos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("lineaInvestigacionEdit"))+'</span>';
        }
        splitted=value.split('thod/',2);
        if(splitted[0]=='/dashboard/edit-me'){
            return '<span>Contenidos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("metodoEdit"))+'</span>';
        }
        splitted=value.split('quipo/',2);
        if(splitted[0]=='/dashboard/edit-e'){
            return '<span>Contenidos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("equipoEdit"))+'</span>';
        }
        splitted=value.split('tware/',2);
        if(splitted[0]=='/dashboard/edit-sof'){
            return '<span>Software </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("softwareEdit"))+'</span>';
        }
        splitted=value.split('ject/',2);
        if(splitted[0]=='/dashboard/edit-pro'){
            return '<span>Proyectos </span><span class="grey-title">- '+JSON.parse(localStorage.getItem("proyectoEdit"))+'</span>';
        }
        splitted=value.split('board/',2);
        if(splitted[0]=='/dash'){
            return '<span>Página no encontrada</span>';
        }
    }

    setEndSession(value){
        localStorage.setItem("sessionEnd", value);
    }

    reset;

    setReset(value){
        this.reset=value;
    }

    getReset(){
        return this.reset;
    }

}