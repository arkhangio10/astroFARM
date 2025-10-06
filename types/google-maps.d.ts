// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): MapsEventListener;
      setIcon(icon: string | Icon | Symbol): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      gestureHandling?: GestureHandlingOptions;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      streetViewControl?: boolean;
      rotateControl?: boolean;
      fullscreenControl?: boolean;
      clickableIcons?: boolean;
      disableDoubleClickZoom?: boolean;
      keyboardShortcuts?: boolean;
      styles?: MapTypeStyle[];
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
    }

    interface Icon {
      url?: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    interface Size {
      width: number;
      height: number;
    }

    interface Point {
      x: number;
      y: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    enum MapTypeId {
      HYBRID = 'hybrid',
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      TERRAIN = 'terrain'
    }

    type GestureHandlingOptions = 'auto' | 'cooperative' | 'greedy' | 'none';

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: MapTypeStyler[];
    }

    interface MapTypeStyler {
      color?: string;
      visibility?: string;
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace places {
      // Placeholder para Places API si se necesita en el futuro
    }
  }
}

export {};
