

export const displayMap = locations => {
    mapboxgl.accessToken = process.env.MAPBOX_TOKEN;
    var map = new mapboxgl.Map({
    container: 'map',
    style: process.env.MAPBOX_STYLE,
    scrollZoom: false
    /* center: [-47.248088, -21.828396999999974 ],
    zoom: 10,
    interactive: false */
    });
     
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach( loc => {
        const el = document.createElement('div');
        el.className="marker";
    
    
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
    
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
    
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds, {
       padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
       } 
    });

}

