
import mapboxgl from 'mapbox-gl';

export class Map3DControls {
  static addControls(map: mapboxgl.Map): void {
    // Add navigation controls with enhanced 3D support
    map.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add custom 3D toggle control
    const toggle3DControl = {
      onAdd: function(map: mapboxgl.Map) {
        const container = document.createElement('div');
        container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        container.style.background = 'white';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';

        const button = document.createElement('button');
        button.className = 'mapboxgl-ctrl-icon';
        button.type = 'button';
        button.title = 'Toggle 3D View';
        button.innerHTML = '🏔️';
        button.style.fontSize = '16px';
        button.style.width = '29px';
        button.style.height = '29px';
        button.style.border = 'none';
        button.style.background = 'transparent';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        let is3D = true;

        button.addEventListener('click', () => {
          if (is3D) {
            map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
            button.innerHTML = '🗺️';
            button.title = 'Switch to 3D View';
            is3D = false;
          } else {
            map.easeTo({ pitch: 45, bearing: 0, duration: 1000 });
            button.innerHTML = '🏔️';
            button.title = 'Switch to 2D View';
            is3D = true;
          }
        });

        container.appendChild(button);
        return container;
      },
      onRemove: function() {}
    };

    map.addControl(toggle3DControl as any, 'top-right');
  }

  static setup3DFeatures(map: mapboxgl.Map): void {
    map.on('style.load', () => {
      console.log('🏔️ Adding 3D terrain and buildings...');

      // Add terrain source for 3D elevation
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      // Set terrain for 3D elevation
      map.setTerrain({
        'source': 'mapbox-dem',
        'exaggeration': 1.5
      });

      // Add 3D buildings layer
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      map.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );

      // Add atmospheric lighting
      map.setLight({
        'anchor': 'viewport',
        'color': 'white',
        'intensity': 0.4
      });

      console.log('✅ 3D terrain and buildings added successfully');
    });
  }
}
