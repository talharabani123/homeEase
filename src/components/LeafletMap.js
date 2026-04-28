/**
 * LeafletMap — Leaflet.js + OpenStreetMap + OSRM real routing inside a WebView.
 *
 * Props:
 *   customerLocation   { latitude, longitude, name? }
 *   providerLocation   { latitude, longitude, name? }
 *   mode               'customer' | 'provider'
 *   onReady            () => void
 *   onRouteUpdate      ({ distance, duration, steps }) => void
 *   style              ViewStyle
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/* ─────────────────────────────────────────────────────────────────────────────
   HTML / JS injected into the WebView
   Everything runs inside the browser context — no RN imports allowed here.
───────────────────────────────────────────────────────────────────────────── */
const buildHTML = (cLat, cLng, pLat, pLng, mode, customerName, providerName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <title>HomeEase Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;background:#e8f4f8}

    /* ── Markers ── */
    .mk-wrap{display:flex;flex-direction:column;align-items:center;pointer-events:none}
    .mk-pin{
      width:46px;height:46px;border-radius:50%;border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;font-size:22px;
      box-shadow:0 4px 14px rgba(0,0,0,.25);
    }
    .mk-pin.blue{background:#1D4ED8;box-shadow:0 4px 14px rgba(29,78,216,.45)}
    .mk-pin.red {background:#DC2626;box-shadow:0 4px 14px rgba(220,38,38,.45)}
    .mk-label{
      margin-top:4px;background:rgba(0,0,0,.72);color:#fff;
      font-size:11px;font-weight:700;padding:2px 9px;border-radius:10px;
      white-space:nowrap;letter-spacing:.3px;
    }

    /* ── Pulse ring (customer) ── */
    .pulse-wrap{position:relative;display:flex;align-items:center;justify-content:center}
    .pulse-ring{
      position:absolute;width:64px;height:64px;border-radius:50%;
      background:rgba(29,78,216,.18);animation:pulse 2.2s ease-out infinite;
    }
    @keyframes pulse{0%{transform:scale(.5);opacity:1}100%{transform:scale(2);opacity:0}}

    /* ── Provider direction arrow ── */
    .arrow-wrap{position:relative;display:flex;align-items:center;justify-content:center}
    .direction-arrow{
      position:absolute;top:-18px;font-size:18px;
      transform-origin:center bottom;transition:transform .4s ease;
    }

    /* ── Popup ── */
    .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:0}
    .leaflet-popup-content{margin:0}
    .popup{padding:12px 16px;min-width:160px}
    .popup-title{font-weight:800;font-size:14px;color:#111;margin-bottom:3px}
    .popup-sub{font-size:12px;color:#555}
    .popup-dist{font-size:13px;font-weight:700;color:#16A34A;margin-top:5px}
    .popup-eta{font-size:12px;color:#2563EB;margin-top:2px}

    /* ── Loading overlay ── */
    #loader{
      position:fixed;inset:0;background:rgba(232,244,248,.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      z-index:9999;gap:12px;transition:opacity .4s;
    }
    #loader.hidden{opacity:0;pointer-events:none}
    .spinner{
      width:40px;height:40px;border:4px solid #ddd;
      border-top-color:#1D4ED8;border-radius:50%;animation:spin .8s linear infinite;
    }
    @keyframes spin{to{transform:rotate(360deg)}}
    #loader p{font-size:14px;color:#444;font-weight:600}

    /* ── Info bar (bottom) ── */
    #infobar{
      position:fixed;bottom:0;left:0;right:0;
      background:rgba(255,255,255,.96);backdrop-filter:blur(8px);
      padding:10px 16px;display:flex;gap:20px;align-items:center;
      box-shadow:0 -2px 12px rgba(0,0,0,.1);z-index:1000;
      border-top-left-radius:16px;border-top-right-radius:16px;
    }
    .info-item{display:flex;flex-direction:column;align-items:center;flex:1}
    .info-val{font-size:18px;font-weight:800;color:#111}
    .info-lbl{font-size:11px;color:#888;font-weight:600;margin-top:1px}
    #route-status{font-size:12px;color:#16A34A;font-weight:700;text-align:center;flex:2}
  </style>
</head>
<body>
<div id="loader"><div class="spinner"></div><p>Loading map…</p></div>
<div id="map"></div>
<div id="infobar">
  <div class="info-item">
    <span class="info-val" id="dist-val">—</span>
    <span class="info-lbl">Distance</span>
  </div>
  <div id="route-status">Fetching route…</div>
  <div class="info-item">
    <span class="info-val" id="eta-val">—</span>
    <span class="info-lbl">ETA</span>
  </div>
</div>

<script>
// ── State ────────────────────────────────────────────────────────────────────
var CUSTOMER = { lat: ${cLat}, lng: ${cLng}, name: '${customerName}' };
var PROVIDER = { lat: ${pLat}, lng: ${pLng}, name: '${providerName}' };
var MODE     = '${mode}';

var routeLayer   = null;
var routeFetching = false;
var lastRoutePt  = null; // last provider pos used for route fetch

// ── Haversine ────────────────────────────────────────────────────────────────
function haversine(lat1,lon1,lat2,lon2){
  var R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  var a=Math.sin(dLat/2)*Math.sin(dLat/2)+
        Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
        Math.sin(dLon/2)*Math.sin(dLon/2);
  return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
}

// ── Bearing (degrees) ────────────────────────────────────────────────────────
function bearing(lat1,lon1,lat2,lon2){
  var dLon=(lon2-lon1)*Math.PI/180;
  var y=Math.sin(dLon)*Math.cos(lat2*Math.PI/180);
  var x=Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180)-
        Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLon);
  return ((Math.atan2(y,x)*180/Math.PI)+360)%360;
}

// ── Format duration ──────────────────────────────────────────────────────────
function fmtDuration(secs){
  var m=Math.ceil(secs/60);
  return m<60 ? m+' min' : Math.floor(m/60)+'h '+(m%60)+'m';
}

// ── Init map ─────────────────────────────────────────────────────────────────
var map = L.map('map',{zoomControl:false,attributionControl:false});

// Zoom control top-right
L.control.zoom({position:'topright'}).addTo(map);

// OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19, attribution:'© OpenStreetMap'
}).addTo(map);

// ── Icons ────────────────────────────────────────────────────────────────────
function makeIcon(pinClass, emoji, label, withPulse, withArrow){
  var inner = withPulse
    ? '<div class="pulse-wrap"><div class="pulse-ring"></div><div class="mk-pin '+pinClass+'">'+emoji+'</div></div>'
    : withArrow
      ? '<div class="arrow-wrap"><div class="direction-arrow" id="dir-arrow">⬆️</div><div class="mk-pin '+pinClass+'">'+emoji+'</div></div>'
      : '<div class="mk-pin '+pinClass+'">'+emoji+'</div>';
  return L.divIcon({
    html:'<div class="mk-wrap">'+inner+'<div class="mk-label">'+label+'</div></div>',
    className:'', iconSize:[64,76], iconAnchor:[32,70]
  });
}

var customerIcon = makeIcon('blue','👤', CUSTOMER.name || 'You',    true,  false);
var providerIcon = makeIcon('red', '🔧', PROVIDER.name || 'Provider', false, true);

// ── Markers ──────────────────────────────────────────────────────────────────
var customerMarker = L.marker([CUSTOMER.lat,CUSTOMER.lng],{icon:customerIcon,zIndexOffset:100})
  .addTo(map)
  .bindPopup(buildCustomerPopup());

var providerMarker = L.marker([PROVIDER.lat,PROVIDER.lng],{icon:providerIcon,zIndexOffset:200})
  .addTo(map)
  .bindPopup(buildProviderPopup(PROVIDER.lat,PROVIDER.lng));

function buildCustomerPopup(){
  return '<div class="popup">'+
    '<div class="popup-title">📍 '+(CUSTOMER.name||'Your Location')+'</div>'+
    '<div class="popup-sub">Service destination</div>'+
  '</div>';
}
function buildProviderPopup(pLat,pLng){
  var d=haversine(pLat,pLng,CUSTOMER.lat,CUSTOMER.lng);
  return '<div class="popup">'+
    '<div class="popup-title">🔧 '+(PROVIDER.name||'Service Provider')+'</div>'+
    '<div class="popup-sub">On the way to you</div>'+
    '<div class="popup-dist">'+d+' km away</div>'+
  '</div>';
}

// ── Fit bounds ───────────────────────────────────────────────────────────────
function fitBoth(){
  var bounds=L.latLngBounds(
    [CUSTOMER.lat,CUSTOMER.lng],[PROVIDER.lat,PROVIDER.lng]
  );
  map.fitBounds(bounds,{padding:[70,70],maxZoom:16});
}
fitBoth();

// ── OSRM route fetch ─────────────────────────────────────────────────────────
function fetchRoute(fromLat,fromLng,toLat,toLng){
  if(routeFetching) return;
  routeFetching=true;
  setRouteStatus('Fetching route…');

  var url='https://router.project-osrm.org/route/v1/driving/'+
    fromLng+','+fromLat+';'+toLng+','+toLat+
    '?overview=full&geometries=geojson&steps=true';

  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data){
      routeFetching=false;
      if(!data.routes||!data.routes.length){
        fallbackRoute(fromLat,fromLng,toLat,toLng);
        return;
      }
      var route=data.routes[0];
      var coords=route.geometry.coordinates.map(function(c){return[c[1],c[0]];});

      // Remove old route layer
      if(routeLayer) map.removeLayer(routeLayer);

      // Draw route — thick colored line with casing for visibility
      var casing=L.polyline(coords,{color:'#fff',weight:8,opacity:.6});
      var line   =L.polyline(coords,{color:'#DC2626',weight:5,opacity:.9,lineJoin:'round',lineCap:'round'});
      routeLayer=L.layerGroup([casing,line]).addTo(map);

      // Update info bar
      var distKm=(route.distance/1000).toFixed(2);
      var dur=fmtDuration(route.duration);
      setDistVal(distKm+' km');
      setEtaVal(dur);
      setRouteStatus('Route ready ✓');

      // Post to React Native
      postRN({type:'routeUpdate',distance:distKm,duration:dur,steps:route.legs[0].steps.length});
      lastRoutePt={lat:fromLat,lng:fromLng};
    })
    .catch(function(){
      routeFetching=false;
      fallbackRoute(fromLat,fromLng,toLat,toLng);
    });
}

// Straight-line fallback if OSRM fails
function fallbackRoute(fromLat,fromLng,toLat,toLng){
  if(routeLayer) map.removeLayer(routeLayer);
  routeLayer=L.polyline(
    [[fromLat,fromLng],[toLat,toLng]],
    {color:'#DC2626',weight:4,opacity:.8,dashArray:'12,7'}
  ).addTo(map);
  var d=haversine(fromLat,fromLng,toLat,toLng);
  setDistVal(d+' km');
  setEtaVal(Math.ceil(d*3)+' min');
  setRouteStatus('Straight-line route');
}

// ── Info bar helpers ─────────────────────────────────────────────────────────
function setDistVal(v){ document.getElementById('dist-val').textContent=v; }
function setEtaVal(v) { document.getElementById('eta-val').textContent=v;  }
function setRouteStatus(v){ document.getElementById('route-status').textContent=v; }

// ── Smooth marker animation ──────────────────────────────────────────────────
// Interpolates between old and new position over ~600ms
function animateMarker(marker, toLat, toLng){
  var from=marker.getLatLng();
  var steps=20, step=0;
  var dLat=(toLat-from.lat)/steps;
  var dLng=(toLng-from.lng)/steps;
  var timer=setInterval(function(){
    step++;
    marker.setLatLng([from.lat+dLat*step, from.lng+dLng*step]);
    if(step>=steps) clearInterval(timer);
  }, 30);
}

// ── Update provider location ─────────────────────────────────────────────────
function updateProvider(lat,lng){
  var oldLat=PROVIDER.lat, oldLng=PROVIDER.lng;
  PROVIDER.lat=lat; PROVIDER.lng=lng;

  // Smooth animation
  animateMarker(providerMarker, lat, lng);

  // Rotate direction arrow
  var b=bearing(lat,lng,CUSTOMER.lat,CUSTOMER.lng);
  var arrow=document.getElementById('dir-arrow');
  if(arrow) arrow.style.transform='rotate('+b+'deg)';

  // Update popup
  providerMarker.setPopupContent(buildProviderPopup(lat,lng));

  // Re-fetch route only if moved >30m to avoid hammering OSRM
  var moved=haversine(oldLat,oldLng,lat,lng)*1000; // metres
  if(!lastRoutePt || moved>30){
    fetchRoute(lat,lng,CUSTOMER.lat,CUSTOMER.lng);
  } else {
    // Just update the route start point
    if(routeLayer){
      var layers=routeLayer.getLayers ? routeLayer.getLayers() : [];
      layers.forEach(function(l){
        if(l.getLatLngs){
          var pts=l.getLatLngs();
          if(pts.length) pts[0]=L.latLng(lat,lng);
          l.setLatLngs(pts);
        }
      });
    }
    var d=haversine(lat,lng,CUSTOMER.lat,CUSTOMER.lng);
    setDistVal(d+' km');
    postRN({type:'distance',value:d});
  }

  // Auto-fit if both markers visible
  fitBoth();
}

// ── Message bridge (React Native → WebView) ──────────────────────────────────
function handleMsg(raw){
  try{
    var msg=JSON.parse(raw);
    if(msg.type==='updateProvider') updateProvider(msg.lat,msg.lng);
    if(msg.type==='fitBounds')      fitBoth();
  }catch(e){}
}
document.addEventListener('message',function(e){handleMsg(e.data);});
window.addEventListener('message',  function(e){handleMsg(e.data);});

// ── Post to React Native ─────────────────────────────────────────────────────
function postRN(obj){
  if(window.ReactNativeWebView)
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
}

// ── Initial route fetch ──────────────────────────────────────────────────────
fetchRoute(PROVIDER.lat,PROVIDER.lng,CUSTOMER.lat,CUSTOMER.lng);

// ── Hide loader once tiles start loading ─────────────────────────────────────
map.once('load',function(){ hideLoader(); });
setTimeout(hideLoader, 3000); // fallback
function hideLoader(){
  var el=document.getElementById('loader');
  if(el){ el.classList.add('hidden'); setTimeout(function(){el.remove();},500); }
  postRN({type:'ready'});
}
</script>
</body>
</html>
`;

/* ─────────────────────────────────────────────────────────────────────────────
   React Native component
───────────────────────────────────────────────────────────────────────────── */

const LeafletMap = ({
  customerLocation,
  providerLocation,
  mode = 'customer',
  customerName,
  providerName,
  onReady,
  onRouteUpdate,
  style,
}) => {
  const webViewRef = useRef(null);

  // Fallback coords (Karachi centre)
  const cLat = customerLocation?.latitude  ?? 24.8607;
  const cLng = customerLocation?.longitude ?? 67.0011;
  const pLat = providerLocation?.latitude  ?? (cLat + 0.012);
  const pLng = providerLocation?.longitude ?? (cLng + 0.012);

  const cName = customerName || customerLocation?.name || 'You';
  const pName = providerName || providerLocation?.name || 'Provider';

  const html = buildHTML(cLat, cLng, pLat, pLng, mode, cName, pName);

  // Push provider location updates into the WebView
  useEffect(() => {
    if (!providerLocation || !webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify({
      type: 'updateProvider',
      lat:  providerLocation.latitude,
      lng:  providerLocation.longitude,
    }));
  }, [providerLocation?.latitude, providerLocation?.longitude]);

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready'       && onReady)       onReady();
      if (msg.type === 'routeUpdate' && onRouteUpdate) onRouteUpdate(msg);
      if (msg.type === 'distance'    && onRouteUpdate) onRouteUpdate({ distance: msg.value });
    } catch (_) {}
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
        // Allow OSRM + OSM network requests
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 0 },
  webview:   { flex: 1, backgroundColor: '#e8f4f8' },
});

export default LeafletMap;
