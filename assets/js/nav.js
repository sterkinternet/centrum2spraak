/**
 * Centrum 2Spraak - Navigation Toggle
 * Mobile hamburger menu and smooth scroll
 */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  // Shrink logo on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var scrolled = false;
    window.addEventListener('scroll', function () {
      var shouldShrink = window.scrollY > 20;
      if (shouldShrink !== scrolled) {
        scrolled = shouldShrink;
        header.classList.toggle('scrolled', scrolled);
      }
    }, { passive: true });
  }

  // Render a real map with markers so location positions stay accurate.
  var locationMap = document.querySelector('.location-map[data-map-center-lat][data-map-center-lng][data-map-zoom]');

  function escapeHtml(value) {
    return value.replace(/[&<>\"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function readMapLocations(mapElement) {
    var dataElement = mapElement.parentElement.querySelector('.location-map-data');

    if (!dataElement) {
      return [];
    }

    try {
      return JSON.parse(dataElement.textContent);
    } catch (error) {
      return [];
    }
  }

  if (locationMap && window.L) {
    var locations = readMapLocations(locationMap);
    var zoom = Number(locationMap.dataset.mapZoom);
    var centerLat = Number(locationMap.dataset.mapCenterLat);
    var centerLng = Number(locationMap.dataset.mapCenterLng);
    var map = window.L.map(locationMap, {
      scrollWheelZoom: false
    }).setView([centerLat, centerLng], zoom);
    var bounds = [];

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap-bijdragers'
    }).addTo(map);

    locations.forEach(function (location) {
      var lat = Number(location.lat);
      var lng = Number(location.lng);
      var title = String(location.name || '').trim();
      var address = String(location.address || '').trim();
      var mapsUrl = String(location.mapsUrl || '');
      var marker;

      if (!isFinite(lat) || !isFinite(lng) || !title || !mapsUrl) {
        return;
      }

      marker = window.L.marker([lat, lng]).addTo(map);
      marker.bindPopup(
        '<strong>' + escapeHtml(title) + '</strong>' +
        (address ? '<p class="map-popup-address">' + escapeHtml(address) + '</p>' : '') +
        '<a href="' + mapsUrl + '" target="_blank" rel="noopener">Open in Google Maps</a>'
      );
      bounds.push([lat, lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, {
        padding: [36, 36]
      });
    }

    window.addEventListener('resize', function () {
      map.invalidateSize();
    }, { passive: true });
  }
})();
