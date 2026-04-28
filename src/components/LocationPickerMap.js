/**
 * LocationPickerMap
 * Leaflet.js + OpenStreetMap pin-drop map with Nominatim reverse geocoding.
 *
 * Props:
 *   initialLat      number   – starting latitude  (default: Karachi)
 *   initialLng      number   – starting longitude
 *   onLocationPick  ({ latitude, longitude, address, components }) => void
 *   style           ViewStyle
 */

import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Nominatim address builder (runs inside WebView JS) ───────────────────────
// Exported as a string so it can be embedded in the HTML template literal.
const NOMINATIM_BUILDER = `
function buildAddress(data) {
  var a = data.address || {};

  // Priority-ordered field groups
  var houseNum  = a.house_number || '';
  var road      = a.road || a.pedestrian || a.footway || a.path || '';
  var suburb    = a.suburb || a.neighbourhood || a.quarter || '';
  var locality  = a.village || a.town || a.city_district || a.county || '';
  var city      = a.city || a.municipality || '';
  var state     = a.state || '';
  var country   = a.country || '';

  // Build parts — skip empty / "unnamed" values
  var parts = [];
  if (houseNum && road)  parts.push(houseNum + ' ' + road);
  else if (road)         parts.push(road);
  if (suburb)            parts.push(suburb);
  if (locality && locality !== city) parts.push(locality);
  if (city)              parts.push(city);
  if (state && state !== city) parts.push(state);

  // Fallback: use display_name trimmed to first 3 segments
  if (parts.length === 0 && data.display_name) {
    parts = data.display_name.split(',').slice(0, 3).map(function(s){ return s.trim(); });
  }

  return {
    address:    parts.join(', '),
    components: { houseNum, road, suburb, locality, city, state, country }
  };
}
`;

// ─── Full HTML page ───────────────────────────────────────────────────────────
const buildHTML = (initLat, initLng) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;background:#e8f4f8}

    /* ── Centre crosshair ── */
    #crosshair{
      position:fixed;top:50%;left:50%;
      transform:translate(-50%,-50%);
      pointer-events:none;z-index:800;
    }
    #crosshair svg{ filter:drop-shadow(0 2px 6px rgba(0,0,0,.35)); }

    /* ── Address bar ── */
    #addr-bar{
      position:fixed;top:12px;left:12px;right:12px;
      background:rgba(255,255,255,.97);border-radius:14px;
      padding:12px 14px;z-index:900;
      box-shadow:0 4px 20px rgba(0,0,0,.18);
      display:flex;align-items:flex-start;gap:10px;
    }
    #addr-icon{font-size:20px;flex-shrink:0;margin-top:1px}
    #addr-text{flex:1}
    #addr-main{font-size:14px;font-weight:700;color:#111;line-height:1.3}
    #addr-sub {font-size:12px;color:#666;margin-top:2px;line-height:1.3}

    /* ── Spinner inside address bar ── */
    .spin{
      display:inline-block;width:16px;height:16px;
      border:2px solid #ddd;border-top-color:#1D4ED8;
      border-radius:50%;animation:sp .7s linear infinite;vertical-align:middle;
    }
    @keyframes sp{to{transform:rotate(360deg)}}

    /* ── Drag hint ── */
    #hint{
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.65);color:#fff;font-size:12px;font-weight:600;
      padding:6px 16px;border-radius:20px;z-index:900;
      pointer-events:none;transition:opacity .5s;
    }
    #hint.hidden{opacity:0}

    /* ── Confirm button ── */
    #confirm-btn{
      position:fixed;bottom:16px;left:16px;right:16px;
      background:#16A34A;color:#fff;font-size:16px;font-weight:700;
      border:none;border-radius:14px;padding:16px;
      box-shadow:0 4px 16px rgba(22,163,74,.4);
      cursor:pointer;z-index:900;letter-spacing:.3px;
    }
    #confirm-btn:active{background:#15803D}
    #confirm-btn:disabled{background:#9CA3AF;box-shadow:none}
  </style>
</head>
<body>

<!-- Centre crosshair (always at map centre) -->
<div id="crosshair">
  <svg width="48" height="48" viewBox="0 0 48 48">
    <!-- shadow circle -->
    <circle cx="24" cy="24" r="18" fill="rgba(220,38,38,.12)"/>
    <!-- pin body -->
    <path d="M24 6 C17.4 6 12 11.4 12 18 C12 26.4 24 42 24 42 C24 42 36 26.4 36 18 C36 11.4 30.6 6 24 6 Z"
          fill="#DC2626" stroke="#fff" stroke-width="2"/>
    <!-- pin hole -->
    <circle cx="24" cy="18" r="5" fill="#fff"/>
    <!-- crosshair lines -->
    <line x1="24" y1="2"  x2="24" y2="10" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
    <line x1="24" y1="38" x2="24" y2="46" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
    <line x1="2"  y1="24" x2="10" y2="24" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
    <line x1="38" y1="24" x2="46" y2="24" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>

<!-- Address display -->
<div id="addr-bar">
  <div id="addr-icon">📍</div>
  <div id="addr-text">
    <div id="addr-main"><span class="spin"></span> Getting location…</div>
    <div id="addr-sub"></div>
  </div>
</div>

<!-- Drag hint -->
<div id="hint">Drag map or tap to pick location</div>

<!-- Map -->
<div id="map"></div>

<!-- Confirm -->
<button id="confirm-btn" disabled>Confirm Location</button>

<script>
${NOMINATIM_BUILDER}

// ── State ────────────────────────────────────────────────────────────────────
var selected = { lat: ${initLat}, lng: ${initLng}, address: '', components: {} };
var geocodeTimer = null;
var lastGeocoded = null;

// ── Map init ─────────────────────────────────────────────────────────────────
var map = L.map('map', {
  center: [${initLat}, ${initLng}],
  zoom: 16,
  zoomControl: false,
  attributionControl: false
});

L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// ── Reverse geocode via Nominatim ─────────────────────────────────────────────
function reverseGeocode(lat, lng) {
  setAddrLoading();
  clearTimeout(geocodeTimer);

  geocodeTimer = setTimeout(function() {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
              lat + '&lon=' + lng + '&zoom=18&addressdetails=1';

    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var result = buildAddress(data);
        selected.address    = result.address;
        selected.components = result.components;
        lastGeocoded = { lat: lat, lng: lng };
        setAddrText(result.address, result.components);
        enableConfirm();
      })
      .catch(function() {
        selected.address = lat.toFixed(5) + ', ' + lng.toFixed(5);
        setAddrText(selected.address, {});
        enableConfirm();
      });
  }, 600); // debounce 600ms
}

// ── Address bar helpers ───────────────────────────────────────────────────────
function setAddrLoading() {
  document.getElementById('addr-main').innerHTML = '<span class="spin"></span> Fetching address…';
  document.getElementById('addr-sub').textContent = '';
  document.getElementById('confirm-btn').disabled = true;
}

function setAddrText(address, comp) {
  var main = address || 'Location selected';
  var sub  = [comp.city, comp.state].filter(Boolean).join(', ');
  document.getElementById('addr-main').textContent = main;
  document.getElementById('addr-sub').textContent  = sub;
}

function enableConfirm() {
  document.getElementById('confirm-btn').disabled = false;
}

// ── Update selected location from map centre ──────────────────────────────────
function updateFromCentre() {
  var c = map.getCenter();
  selected.lat = c.lat;
  selected.lng = c.lng;
  reverseGeocode(c.lat, c.lng);
}

// ── Map events — update on every move end ────────────────────────────────────
map.on('moveend', updateFromCentre);

// Tap anywhere → pan to that point (crosshair follows)
map.on('click', function(e) {
  map.panTo(e.latlng, { animate: true, duration: 0.3 });
});

// Hide hint after first interaction
map.once('movestart', function() {
  document.getElementById('hint').classList.add('hidden');
});

// ── Confirm button ────────────────────────────────────────────────────────────
document.getElementById('confirm-btn').addEventListener('click', function() {
  postRN({
    type:       'confirm',
    latitude:   selected.lat,
    longitude:  selected.lng,
    address:    selected.address,
    components: selected.components
  });
});

// ── Message bridge (React Native → WebView) ───────────────────────────────────
function handleMsg(raw) {
  try {
    var msg = JSON.parse(raw);
    if (msg.type === 'setLocation') {
      map.setView([msg.lat, msg.lng], 16, { animate: true });
    }
  } catch(e) {}
}
document.addEventListener('message', function(e) { handleMsg(e.data); });
window.addEventListener('message',   function(e) { handleMsg(e.data); });

// ── Post to React Native ──────────────────────────────────────────────────────
function postRN(obj) {
  if (window.ReactNativeWebView)
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
}

// ── Initial geocode ───────────────────────────────────────────────────────────
reverseGeocode(${initLat}, ${initLng});

// Signal ready
setTimeout(function() { postRN({ type: 'ready' }); }, 400);
</script>
</body>
</html>
`;

// ─── React Native component ───────────────────────────────────────────────────
const LocationPickerMap = ({
  initialLat = 24.8607,
  initialLng = 67.0011,
  onLocationPick,
  style,
}) => {
  const webViewRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'confirm' && onLocationPick) {
        onLocationPick({
          latitude:   msg.latitude,
          longitude:  msg.longitude,
          address:    msg.address,
          components: msg.components,
        });
      }
    } catch (_) {}
  };

  // Allow parent to pan map to a new location
  const panTo = (lat, lng) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'setLocation', lat, lng }));
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: buildHTML(initialLat, initialLng) }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webview:   { flex: 1, backgroundColor: '#e8f4f8' },
});

export default LocationPickerMap;
