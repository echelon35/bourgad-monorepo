import { AfterViewInit, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import * as L from 'leaflet';
import { Observable, Subscription } from 'rxjs';
import { MapService } from '../../services/map.service';

@Component({
  standalone: true,
  selector: 'bgd-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {

  @Input() mapId = 'map';
  @Input() allowSearch = false;
  @Input() displayLayers = true;
  @Input() displayScale = true;
  @Input() displayZoom = true;
  @Input() layerPrincipal = "";
  @Input() scrollZoom = true;
  @Input() dragMarker = false;
  @Input() zoomDelta = 1;
  @Input() defaultZoom = 3;
  @Input() isVisible = true;

  public isLoading = false;
  
  @Output() markerEvent = new EventEmitter<L.Marker>();
  @Output() movedMap = new EventEmitter<L.Map>();

  //Marker move from outside
  private markerSubscription!: Subscription;
  @Input() cursorEvent!: Observable<GeoJSON.Point>;

  private fullscreenSubscription!: Subscription;
  @Input() fullscreenMe!: Observable<void>;

  markerPost!: L.Marker;

  public mapDetail!: L.Map;
  public mapLayer!: L.LayerGroup;

  private readonly mapService = inject(MapService);

  ngOnInit(): void {
    this.mapService.setMap(this.mapId, null, this.isVisible);
  }

  ngAfterViewInit(): void {
    if (this.isVisible && !this.mapDetail) {
      this.initMap();
    }
  }

  ngOnDestroy(){
    if(this.mapDetail != undefined){
      this.mapDetail.remove();
    }

    if(this.markerSubscription != undefined){
      this.markerSubscription.unsubscribe();
    }

    if(this.fullscreenSubscription != undefined){
      this.fullscreenSubscription.unsubscribe();
    }
  }

  initMap(){
    console.log(this.mapId);
      // Déclaration de la carte avec les coordonnées du centre et le niveau de zoom.
      this.mapDetail = L.map(this.mapId,{
        center: [0, 0],
        boxZoom: true,
        zoom: this.defaultZoom,
        zoomControl: this.displayZoom,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
        zoomDelta: this.zoomDelta,
        zoomSnap: 0
      });

      //Map limited to world
      this.limitMap(-90,-360,90,360);
      this.setZoom(6,6,18);

      if(this.dragMarker){
        this.draggableMarker();
      }

      if(this.displayScale){
        L.control.scale({
          position: 'bottomright',
          imperial: false
        }).addTo(this.mapDetail);
      }

      this.layers();

      if(this.displayZoom){
        L.control.zoom({
          position:'topleft',
          zoomInTitle:'Zoomer',
          zoomOutTitle: 'Dézoomer'
        }).addTo(this.mapDetail);
      }

      this.mapDetail.addEventListener("dragend",() =>{
        this.movedMap.emit(this.mapDetail);
      },this)

      this.mapService.setMap(this.mapId, this.mapDetail);

      if(this.cursorEvent != null){
        this.markerSubscription = this.cursorEvent.subscribe(point => {
          ////console.log("le curseur de la map se déplace : " + JSON.stringify(point));
          this.mapDetail.setView(L.latLng(point.coordinates[1],point.coordinates[0]),10)
          this.markerPost.setLatLng(L.latLng(point.coordinates[1],point.coordinates[0]))
          this.markerEvent.emit(this.markerPost);
        })
      }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isVisible']){
      console.log('Visibility changed:', this.isVisible);
    }
    if (changes['isVisible'] && this.isVisible && !this.mapDetail) {
      console.log('Map is visible and not initialized, initializing now...');
      this.initMap();
    } else if (changes['isVisible'] && this.isVisible && this.mapDetail) {
      console.log('Map is visible and already initialized, just updating size...');
      // Si la carte existe et devient visible, on force un redimensionnement
      setTimeout(() => this.mapDetail?.invalidateSize(), 0);
    }
  }

  layers(){
    // let huerotate;

    const GoogleEarthTileLayer = (L.tileLayer as any)('http://mt0.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}',{
    })

    const GoogleMapTileLayer = (L.tileLayer as any)('http://mt0.google.com/vt/lyrs=m&hl=fr&x={x}&y={y}&z={z}',{
    })

    const JawgTileLayer = (L.tileLayer as any)('https://tile.jawg.io/34fa4b5e-6497-4ed4-9a53-23e44dbdf27e/{z}/{x}/{y}{r}.png?access-token=ukBPEdd9zS9XT8Plhf7xyjOrtHRpr4TbAGV7RMVOLFNwDdUkNPbg5kz3oOXAL2Hv',{
      attribution: '<a href="https://bourgad" title="Made by Bourgad" target="_blank">&copy; <b>Bourgad</b></a> with <a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })

    const JawgDarkLayer = (L.tileLayer as any)('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=ukBPEdd9zS9XT8Plhf7xyjOrtHRpr4TbAGV7RMVOLFNwDdUkNPbg5kz3oOXAL2Hv',{
      attribution: '<a href="https://bourgad" title="Made by Bourgad" target="_blank">&copy; <b>Bourgad</b></a> with <a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
   
    switch(this.layerPrincipal){
      case 'GoogleEarth':
        GoogleEarthTileLayer.addTo(this.mapDetail);
        break;
      case 'GoogleMap':
        GoogleMapTileLayer.addTo(this.mapDetail);
        break;
      case 'Dark':
        JawgDarkLayer.addTo(this.mapDetail);
        break;
      default:
        JawgTileLayer.addTo(this.mapDetail);
    }

    //Ajout des différents layers
    if(this.displayLayers){
      L.control.layers({
        "GoogleEarth": GoogleEarthTileLayer,
        "GoogleMap": GoogleMapTileLayer,
        "Dark": JawgDarkLayer,
      }).addTo(this.mapDetail);
    }
  }

  limitMap(xMin: number,yMin: number,xMax: number,yMax: number){
		//South-West
		const southWest = L.latLng(xMin,yMin);
		//North-East
		const northEast = L.latLng(xMax,yMax);
		//All map size
		const bounds = L.latLngBounds(southWest, northEast);
		this.mapDetail.setMaxBounds(bounds);
		return this.mapDetail;
  }

	setZoom(zoom: number,minZoom: number,maxZoom: number){
		//Set the zoom of map
		this.mapDetail.setZoom(zoom);
		if(typeof(minZoom) != 'undefined'){
			this.mapDetail.options.minZoom = minZoom;
		}
		if(typeof(maxZoom) != 'undefined'){
			this.mapDetail.options.maxZoom = maxZoom;
		}
		return this.mapDetail;
  }

  draggableMarker(){
    this.markerPost = new L.Marker([0,0],{
      icon: new L.Icon({
        iconUrl: "assets/svg/marker.svg",	
        iconSize:     [60, 60], // size of icon
        iconAnchor:   [30, 60], // marker position on icon
        popupAnchor:  [0, -20] // point depuis lequel la popup doit s'ouvrir relativement à l'iconAnchor
      }),
      draggable: true,
      attribution: "post"
    });

    //Tooltip indiquant au user de déplacer le curseur
    this.markerPost.bindTooltip("Déplacez-moi ou aidez-vous de la barre de recherche",{
      permanent: true,
      className: 'bg-dark text-light',
      direction: "top",
      offset: [0, -60]
    })

    //Sur le déplacement du curseur, mise à jour de la déclaration
    this.markerPost.addEventListener("moveend",(e) =>{
      this.markerEvent.emit(e.target);
    },this);

    this.markerPost.addTo(this.mapDetail);
  }

  getMap(): L.Map {
    return this.mapDetail;
  }

  // updateMap(){
  //   this.map$.emit(this.mapDetail);
  //   this.layer$.emit(this.mapLayer);
  // }

  selectMapZone(zone: string){

    let bound;
    let box;

    switch(zone){
      case "METROPOLE":
        //FRANCE METROPOLITAINE
        box = [-6.113481,41.934978,10.307773,51.727030];
        bound = L.latLngBounds(L.latLng(box[3], box[2]),L.latLng(box[1], box[0]))
        this.mapDetail.setMaxBounds(bound);
        break;
      default:
        box = [-90,41.934978,10.307773,51.727030];
        bound = L.latLngBounds(L.latLng(box[3], box[2]),L.latLng(box[1], box[0]))
        this.mapDetail.setMaxBounds(bound);
    }
  }

}
