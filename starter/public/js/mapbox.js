

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hb3NlZ2FudGluaSIsImEiOiJja2s3ZGdsMDYwYmQwMnVtbzNidzlpc3JpIn0.8AdIURp6z7PbiaPAKypijw';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/joaosegantini/ckk7eo7ox0bf017s7qv75ivcz',
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

