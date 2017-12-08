/* 
 * Copyright 2015-2016 Canada Centre for Mapping and Earth Observation, 
 * Earth Sciences Sector, Natural Resources Canada.
 * 
 * License
 * 
 * By obtaining and/or copying this work, you (the licensee) agree that you have 
 * read, understood, and will comply with the following terms and conditions.
 * 
 * Permission to copy, modify, and distribute this work, with or without 
 * modification, for any purpose and without fee or royalty is hereby granted, 
 * provided that you include the following on ALL copies of the work or portions 
 * thereof, including modifications:
 * 
 * The full text of this NOTICE in a location viewable to users of the 
 * redistributed or derivative work.
 * 
 * Any pre-existing intellectual property disclaimers, notices, or terms and 
 * conditions. If none exist, the W3C Software and Document Short Notice should 
 * be included.
 * 
 * Notice of any changes or modifications, through a copyright statement on the 
 * new code or document such as "This software or document includes material 
 * copied from or derived from [title and URI of the W3C document]. 
 * Copyright © [YEAR] W3C® (MIT, ERCIM, Keio, Beihang)."
 * 
 * Disclaimers
 * 
 * THIS WORK IS PROVIDED "AS IS," AND COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS 
 * OR WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, WARRANTIES OF 
 * MERCHANTABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE 
 * SOFTWARE OR DOCUMENT WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, 
 * TRADEMARKS OR OTHER RIGHTS.
 * COPYRIGHT HOLDERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR 
 * CONSEQUENTIAL DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENT.
 * 
 * The name and trademarks of copyright holders may NOT be used in advertising or 
 * publicity pertaining to the work without specific, written prior permission. 
 * Title to copyright in this work will at all times remain with copyright holders.
 */
/* global L, Node */
(function (window, document, undefined) {
  
var M = {};
window.M = M;

(function () {
    M.mime = "text/mapml";
    M.CBMTILE = new L.Proj.CRS('EPSG:3978',
  '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
  {
    resolutions: [
      38364.660062653464, 
      22489.62831258996, 
      13229.193125052918, 
      7937.5158750317505, 
      4630.2175937685215, 
      2645.8386250105837,
      1587.5031750063501,
      926.0435187537042, 
      529.1677250021168, 
      317.50063500127004, 
      185.20870375074085, 
      111.12522225044451, 
      66.1459656252646, 
      38.36466006265346, 
      22.48962831258996,
      13.229193125052918,
      7.9375158750317505, 
      4.6302175937685215,
      2.6458386250105836,
      1.5875031750063502,
      0.92604351875370428,
      0.52916772500211673,
      0.31750063500127002,
      0.18520870375074083,
      0.11112522225044451,
      0.066145965625264591
    ],
    origin: [-34655800, 39310000]
  });
    M.APSTILE = new L.Proj.CRS('EPSG:5936',
  '+proj=stere +lat_0=90 +lat_ts=50 +lon_0=-150 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m +no_defs',
  {
    resolutions: [
      238810.813354,
      119405.406677,
      59702.7033384999,
      29851.3516692501,
      14925.675834625,
      7462.83791731252,
      3731.41895865639,
      1865.70947932806,
      932.854739664032,
      466.427369832148,
      233.213684916074,
      116.606842458037,
      58.3034212288862,
      29.1517106145754,
      14.5758553072877,
      7.28792765351156,
      3.64396382688807,
      1.82198191331174,
      0.910990956788164,
      0.45549547826179
    ],
    origin: [-2.8567784109255E7, 3.2567784109255E7]
  });
    M.OSMTILE = L.CRS.EPSG3857;
    L.setOptions(M.OSMTILE,
      { 
        origin: [-20037508.342787, 20037508.342787],
        resolutions: [
          156543.0339,
          78271.51695,
          39135.758475,
          19567.8792375,
          9783.93961875,
          4891.969809375,
          2445.9849046875,
          1222.9924523438,
          611.49622617188,
          305.74811308594,
          152.87405654297,
          76.437028271484,
          38.218514135742,
          19.109257067871,
          9.5546285339355,
          4.7773142669678,
          2.3886571334839,
          1.1943285667419,
          0.59716428337097,
          0.29858214168549,
          0.14929107084274,
          0.074645535421371,
          0.03732276771068573,
          0.018661383855342865,
          0.009330691927671432495
        ]
      });
}());

M.Util = {
  coordsToArray: function(containerPoints) {
    // returns an array of arrays of coordinate pairs coordsToArray("1,2,3,4") -> [[1,2],[3,4]]
    for (var i=1, pairs = [], coords = containerPoints.split(",");i<coords.length;i+=2) {
      pairs.push([parseInt(coords[i-1]),parseInt(coords[i])]);
    }
    return pairs;
  }
};
M.coordsToArray = M.Util.coordsToArray;

M.ImageOverlay = L.ImageOverlay.extend({
	initialize: function (url, location, size, angle, container, options) { // (String, Point, Point, Number, Element, Object)
                this._container = container;
		this._url = url;
                // instead of calculating where the image goes, put it at 0,0
		//this._location = L.point(location);
                // the location for WMS requests will be the upper left hand
                // corner of the map.  When the map is initialized, that is 0,0,
                // but as the user pans, of course the
		this._location = location;
                this._size = L.point(size);
                this._angle = angle;

		L.setOptions(this, options);
	},
        getEvents: function() {
		var events = {
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
        },
	onAdd: function () {
                this.on({ 
                  load: this._onImageLoad
                  });

		if (!this._image) {
                    this._initImage();
		}

		if (this.options.interactive) {
			L.DomUtil.addClass(this._image, 'leaflet-interactive');
			this.addInteractiveTarget(this._image);
		}

		Polymer.dom(this._container).appendChild(this._image);
		this._reset();
	},
	onRemove: function () {
		L.DomUtil.remove(this._image);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image);
		}
	},
        _onImageLoad: function () {
            if (!this._image) { return; }
            this._image.loaded =  +new Date();
            this._updateOpacity();
        },
	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    translate = this._map.getPixelOrigin().add(this._location).multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(e.center, e.zoom)).round();

		if (L.Browser.any3d) {
			L.DomUtil.setTransform(this._image, translate, scale);
		} else {
			L.DomUtil.setPosition(this._image, translate);
		}
	},
        _reset: function () {
		var image = this._image,
		    location = this._location,
                    size = this._size,
                    angle = 0.0;

                // TBD use the angle to establish the image rotation in CSS

		L.DomUtil.setPosition(image, location);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
        },
	_updateOpacity: function () {
		if (!this._map) { return; }

		//L.DomUtil.setOpacity(this._image, this.options.opacity);

		var now = +new Date(),
		    nextFrame = false;

                var image = this._image;

                var fade = Math.min(1, (now - image.loaded) / 200);

                L.DomUtil.setOpacity(image, fade);
                if (fade < 1) {
                        nextFrame = true;
                } 
		if (nextFrame) {
			L.Util.cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = L.Util.requestAnimFrame(this._updateOpacity, this);
		}
                L.DomUtil.addClass(image, 'leaflet-image-loaded');
	}
        
});
M.imageOverlay = function (url, location, size, angle, container, options) {
        return new M.ImageOverlay(url, location, size, angle, container, options);
};
M.TemplatedLayer = L.Layer.extend({
  
  initialize: function(templates, options) {
    this._templates =  templates;
    L.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-layer');

    for (var i=0;i<templates.length;i++) {
      if (templates[i].type === 'tile') {
          this._templates[i].layer = M.templatedTileLayer(templates[i], 
            L.Util.extend(this.options, {group: this._container, errorTileUrl: "blank.jpg"}));
      } else {
        // create a templated image layer
      }
    }
  },
  onAdd: function (map) {
    Polymer.dom(this.getPane()).appendChild(this._container);
    for (var i=0;i<this._templates.length;i++) {
      map.addLayer(this._templates[i].layer);
    }
    this.setZIndex(this.options.zIndex);
  },
  setZIndex: function (zIndex) {
      this.options.zIndex = zIndex;
      this._updateZIndex();

      return this;
  },
  _updateZIndex: function () {
      if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
          this._container.style.zIndex = this.options.zIndex;
      }
  },
  onRemove: function (map) {
    L.DomUtil.remove(this._container);
    for (var i=0;i<this._templates.length;i++) {
      map.removeLayer(this._templates[i].layer);
    }
  }
});
M.templatedLayer = function(templates, options) {
  // templates is an array of template objects
  // a template object contains the template, plus associated <input> elements
  // which need to be processed just prior to creating a url from the template 
  // with the values of the inputs
  return new M.TemplatedLayer(templates, options);
};
// a TemplateTileLayer is similar to a L.TileLayer except its templates are
// defined by the <extent><template/></extent>
// content found in the MapML document.  As such, the client map does not
// 'revisit' the server for more MapML content, it simply fills the map extent
// with tiles for which it generates requests on demand (as the user pans/zooms/resizes
// the map)
M.TemplatedTileLayer = L.TileLayer.extend({
    initialize: function(template, options) {
      // call the parent constructor with the template tref value, per the 
      // Leaflet tutorial: http://leafletjs.com/examples/extending/extending-1-classes.html#methods-of-the-parent-class
      L.TileLayer.prototype.initialize.call(this, template.template, options);
      L.setOptions(this, L.extend(options,this._setUpTileTemplateVars(template)));
    },
    // instead of being child of a pane, the TemplatedTileLayers are 'owned' by the group,
    // and so are DOM children of the group, not the pane element (the MapMLLayer is
    // a child of the overlay pane and always has a set of sub-layers)
    getPane: function() {
      return this.options.group;
    },
    getTileUrl: function (coords) {
        var obj = {};
        obj[this.options.tile.col] = coords.x;
        obj[this.options.tile.row] = coords.y;
        obj[this.options.tile.zoom] = this._getZoomForUrl();
        obj[this.options.tile.left] = this._tileMatrixToPCRSPosition(coords, 'top-left').x;
        obj[this.options.tile.right] = this._tileMatrixToPCRSPosition(coords, 'top-right').x;
        obj[this.options.tile.top] = this._tileMatrixToPCRSPosition(coords, 'top-left').y;
        obj[this.options.tile.bottom] = this._tileMatrixToPCRSPosition(coords, 'bottom-left').y;
        for (var v in this.options.tile) {
          var vn = `${v}`;
          if (vn !== "row" && vn !== "col" && vn !== "zoom" && vn !== "left" && vn !== "right" && vn !== "top" && vn !== "bottom") {
            obj[v] = this.options.tile[v];
          }
        }
        obj.r = this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '';
        obj.s = this._getSubdomain(coords);  // this is hard-coded, should add an input@type for this?
        return L.Util.template(this._url, obj);
    },
    _tileMatrixToPCRSPosition: function (coords, pos) {
// this is a tile:
// 
//   top-left         top-center           top-right
//      +------------------+------------------+
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      + center-left    center               + center-right
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      |                  |                  |
//      +------------------+------------------+
//   bottom-left     bottom-center      bottom-right

  var map = this._map,
      crs = map.options.crs,
      tileSize = this.getTileSize(),

      nwPoint = coords.scaleBy(tileSize),
      sePoint = nwPoint.add(tileSize),
      centrePoint = nwPoint.add(Math.floor(tileSize / 2)),

      nw = crs.transformation.untransform(nwPoint,crs.scale(coords.z)),
      se = crs.transformation.untransform(sePoint,crs.scale(coords.z)),
      cen = crs.transformation.untransform(centrePoint, crs.scale(coords.z)),
      result = null;

      switch (pos) {
        case('top-left'):
          result = nw;
          break;
        case('bottom-left'):
          result = new L.Point(nw.x,se.y);
          break;
        case('center-left'):
          result = new L.Point(nw.x,cen.y);
          break;
        case('top-right'):
          result = new L.Point(se.x,nw.y);
          break;
        case('bottom-right'):
          result = se;
          break;
        case('center-right'):
          result = new L.Point(se.x,cen.y);
          break;
        case('top-center'):
          result = new L.Point(cen.x,nw.y);
          break;
        case('bottom-center'):
          result = new L.Point(cen.x,se.y);
          break;
        case('center'):
          result = cen;
          break;
      }
      return result;
    },
    _setUpTileTemplateVars: function(template) {
      // process the inputs associated to template and create an object named
      // tile with member properties as follows:
      // {row: 'rowvarname', 
      //  col: 'colvarname', 
      //  left: 'leftvarname', 
      //  right: 'rightvarname', 
      //  top: 'topvarname', 
      //  bottom: 'bottomvarname'}

      var tileVarNames = {tile:{}},
          inputs = template.values;
      
      for (var i=0;i<template.values.length;i++) {
        var type = inputs[i].getAttribute("type"), 
            units = inputs[i].getAttribute("units"), 
            axis = inputs[i].getAttribute("axis"), 
            name = inputs[i].getAttribute("name"), 
            position = inputs[i].getAttribute("position"),
            value = inputs[i].getAttribute("value");
        if (type === "location" && units === "tilematrix") {
          switch (axis) {
            case("column"):
              tileVarNames.tile.col = name;
              break;
            case("row"):
              tileVarNames.tile.row = name;
              break;
            case("easting"):
              if (position) {
                if (position.match(/.*?-left/i)) {
                  tileVarNames.tile.left = name;
                } else if (position.match(/.*?-right/i)) {
                  tileVarNames.tile.right = name;
                }
              } 
              break;
            case("northing"):
              if (position) {
                if (position.match(/top-.*?/i)) {
                  tileVarNames.tile.top = name;
                } else if (position.match(/bottom-.*?/i)) {
                  tileVarNames.tile.bottom = name;
                }
              } 
              break;
            default:
              // unsuportted axis value
          }
        } else if (type === "zoom") {
          //<input name="..." type="zoom" value="0" min="0" max="17"/>
           tileVarNames.tile.zoom = name;
        } else if (type === "hidden") {
           tileVarNames.tile[name] = value;
           // <input name="foo" type="hidden" value="bar"/>
        }
      }
      return tileVarNames;
    }
});
M.templatedTileLayer = function(template, options) {
  return new M.TemplatedTileLayer(template, options);
};
M.MapMLLayer = L.Layer.extend({
    // zIndex has to be set, for the case where the layer is added to the
    // map before the layercontrol is used to control it (where autoZindex is used)
    // e.g. in the raw MapML-Leaflet-Client index.html page.
    options: {
        maxNext: 10,
        zIndex: 0,
        maxZoom: 25
    },
    // initialize is executed before the layer is added to a map
    initialize: function (href, content, options) {
        // in the custom element, the attribute is actually 'src'
        // the _href version is the URL received from layer-@src
        if (href) {
            this._href = href;
        }
        var mapml = content.querySelector('image,feature,tile') ? true : false;
        if (mapml) {
            this._content = content;
        }
        this._el = L.DomUtil.create('div', 'mapml-layer');
        // hit the service to determine what its extent might be
        // OR use the extent of the content provided
        this._initExtent(mapml ? content : null);
        
        // a default extent can't be correctly set without the map to provide
        // its bounds , projection, zoom range etc, so if that stuff's not
        // established by metadata in the content, we should use map properties
        // to set the extent, but the map won't be available until the <layer>
        // element is attached to the <map> element, wait for that to happen.
        this.on('attached', this._validateExtent, this );
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        this._map = map;
        if (!this._mapmlvectors) {
          this._mapmlvectors = M.mapMlFeatures(null,{
              opacity: this.options.opacity,
              onEachFeature: function(feature, layer) {
                var type;
                if (layer instanceof L.Polygon) {
                  type = "Polygon";
                } else if (layer instanceof L.Polyline) {
                  type = "LineString";
                } else if (layer instanceof L.Marker) {
                  type = "Point";
                } else {
                  type = "Unknown";
                }
                var popupContent = "<p>Type: " +  type + "</p>";
                for (var i=0;i<feature.childNodes.length;i++) {
                  if (feature.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                      popupContent += feature.childNodes[i].tagName+ " = " + feature.childNodes[i].textContent +"<br>";
                  }
                }
                layer.bindPopup(popupContent, {autoPan:true});
              }
            });
        }
        map.addLayer(this._mapmlvectors);
        
        if (!this._imageLayer) {
            this._imageLayer = L.layerGroup();
        }
        map.addLayer(this._imageLayer);
        
        if (!this._tileLayer) {
          this._tileLayer = M.mapMLTileLayer(this.href?this.href:this._href, this.options);
        }
        this._tileLayer._el = this._el;
        map.addLayer(this._tileLayer);       
        this._tileLayer._container.appendChild(this._el);
        // if the extent has been initialized and received, update the map,
        /* TODO establish the minZoom, maxZoom for the _tileLayer based on
         * info received from mapml server. */
        if (this._extent) {
            if (this._templateVars) {
              this._templatedLayer = M.templatedLayer(this._templateVars, this.options);
              map.addLayer(this._templatedLayer);
            }
            this._onMoveEnd();
        } else {
            this.once('extentload', function() {
                if (this._templateVars) {
                  this._templatedLayer = M.templatedLayer(this._templateVars, this.options);
                  map.addLayer(this._templatedLayer);
                }
              }, this);
            // if we get to this point and there is no this._extent, it means
            // we're waiting for the server to return one -> get content when
            // that is available.
            this.once('extentload', this._onMoveEnd, this);
        }
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    getEvents: function () {
        return {
//            zoom: this._reset, 
            moveend: this._onMoveEnd
        };
    },
    onRemove: function (map) {
        this._mapmlvectors.clearLayers();
        map.removeLayer(this._mapmlvectors);
        map.removeLayer(this._tileLayer);
        map.removeLayer(this._imageLayer);
        if (this._templatedLayer) {
            map.removeLayer(this._templatedLayer);
        }
    },
    getZoomBounds: function () {
        if (!this._extent) return;
        var bounds = {};
        var v1 = this._extent.querySelector('[type=zoom]').getAttribute('min'),
            v2 = this._extent.querySelector('[type=zoom]').getAttribute('max');
        bounds.min = Math.min(v1,v2);
        bounds.max = Math.max(v1,v2);
        return bounds;
    },
    // retrieve the (projected, scaled) layer extent for the current map zoom level
    getLayerExtentBounds: function(map) {
        
        if (!this._extent) return;
        var zoom = map.getZoom(), projection = map.options.projection,
            projecting = (projection !== this._extent.querySelector('[type=projection]').getAttribute('value')),
            p;
        
        var xmin,ymin,xmax,ymax,v1,v2,extentZoomValue;
            
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('min');
        xmin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=xmin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=xmax]').getAttribute('max');
        xmax = Math.max(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('min');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('min');
        ymin = Math.min(v1,v2);
        v1 = this._extent.querySelector('[type=ymin]').getAttribute('max');
        v2 = this._extent.querySelector('[type=ymax]').getAttribute('max');
        ymax = Math.max(v1,v2);
        // WGS84 can be converted to Tiled CRS units
        if (projecting) {
            //project and scale to M[projection] from WGS84
            p = M[projection];
            var corners = [
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom),
              p.latLngToPoint(L.latLng([ymax,xmax]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmin]),zoom), 
              p.latLngToPoint(L.latLng([ymin,xmax]),zoom)
            ];
            return L.bounds(corners);
        } else {
            // if the zoom level of the extent does not match that of the map
            extentZoomValue = parseInt(this._extent.querySelector('[type=zoom]').getAttribute('value'));
            if (extentZoomValue !== zoom) {
                // convert the extent bounds to corresponding bounds at the current map zoom
                p = M[projection];
                return L.bounds(
                    p.latLngToPoint(p.pointToLatLng(L.point(xmin,ymin),extentZoomValue),zoom),
                    p.latLngToPoint(p.pointToLatLng(L.point(xmax,ymax),extentZoomValue),zoom));
            } else {
                // the extent's zoom value === map.getZoom(), return the bounds
                return L.bounds(L.point(xmin,ymin), L.point(xmax,ymax));
            }
        }
    },
    getAttribution: function () {
        return this.options.attribution;
    },
    _initExtent: function(content) {
        if (!this._href && !content) {return;}
        var layer = this;
        // the this._href (comes from layer@src) should take precedence over 
        // content of the <layer> element, but if no this._href / src is provided
        // but there *is* child content of the <layer> element (which is copied/
        // referred to by this._content), we should use that content.
        if (this._href) {
            var xhr = new XMLHttpRequest();
            _get(this._href, _processInitialExtent);
        } else if (content) {
            // may not set this._extent if it can't be done from the content
            // (eg a single point) and there's no map to provide a default yet
            _processInitialExtent(content);
        }
        function _get(url, fCallback  ) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if(this.status === 200 && this.callback) {
                  this.callback.apply(this, this.arguments ); 
                  return;
                } else if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.arguments = Array.prototype.slice.call(arguments, 2);
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              layer.error = true;
              layer.fire('extentload', layer, true);
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        }
        function _processInitialExtent(content) {
            var mapml = this.responseXML || content;
            if (mapml) {
                var serverExtent = mapml.querySelector('extent');
                if (!serverExtent) {
                    serverExtent = layer._synthesizeExtent(mapml);
                    // the mapml resource does not have a (complete) extent form, save
                    // its content if any so we don't have to revisit the server, ever.
                    if (mapml.querySelector('feature,image,tile')) {
                        layer._content = mapml;
                    }
                } else if (!serverExtent.hasAttribute("action") && serverExtent.querySelector('template') && serverExtent.hasAttribute("units") && serverExtent.getAttribute("units") !== "WGS84") {
                  layer._templateVars = [];
                  // set up the URL template and associated inputs (which yield variable values when processed)
                  var tlist = serverExtent.querySelectorAll('template'),
                      varNamesRe = (new RegExp('(?:\{)(.*?)(?:\})','g'));
                  for (var i=0;i< tlist.length;i++) {
                    var t = tlist[i],
                        template = t.getAttribute('tref'), v,
                        vcount=template.match(varNamesRe),
                        ttype = (!t.hasAttribute('type') || t.getAttribute('type') === 'tile') ? 'tile' : 'image',
                        inputs = [];
                    while ((v = varNamesRe.exec(template)) !== null) {
                      var varName = v[1],
                      inp = serverExtent.querySelector('input[name='+varName+']');
                      if (inp) {
                        inputs.push(inp);
                      } else {
                        console.log('input with name='+varName+' not found for template variable of same name');
                        // no match found, template won't be used
                        break;
                      }
                    }
                    if (template && vcount.length === inputs.length) {
                      // template has a matching input for every variable reference {varref}
                      layer._templateVars.push({template:template, type: ttype, values: inputs});
                    }
                  }
                }
                layer._parseLicenseAndLegend(mapml, layer);
                layer._extent = serverExtent;
                layer._title = mapml.querySelector('title').textContent;
                // BUG https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/29
                //layer._el.appendChild(document.importNode(serverExtent,true));
                if (layer._map) {
                    layer._validateExtent();
                    // if the layer is checked in the layer control, force the addition
                    // of the attribution just received
                    if (layer._map.hasLayer(layer)) {
                        layer._map.attributionControl.addAttribution(layer.getAttribution());
                    }
                    layer._map.fire('moveend', layer);
                }
            } else {
                layer.error = true;
            }
            layer.fire('extentload', layer, false);
        }
    },
    _getMapML: function(url) {
        var layer = this;
        if (url) {
            var requestCounter = 0;
            var xhr = new XMLHttpRequest();
            // add a listener to terminate pulling the feed 
            this._map.once('movestart', function() {
              xhr.abort();
            });
            _pull(url, _processMapMLFeedResponse);
        } else if (this._content) {
            _processMapMLFeedResponse(this._content);
        }
        function _pull(url, fCallback) {
            xhr.onreadystatechange = function () { 
              if(this.readyState === this.DONE) {
                if(this.status === 200 && this.callback) {
                  this.callback.apply(this, this.arguments ); 
                  return;
                } else if (this.status === 400 || 
                    this.status === 404 || 
                    this.status === 500 || 
                    this.status === 406) {
                    layer.error = true;
                    layer.fire('extentload', layer, true);
                    xhr.abort();
                }
              }};
            xhr.arguments = Array.prototype.slice.call(arguments, 2);
            xhr.onload = fCallback;
            xhr.onerror = function () { 
              console.error(this.statusText); 
              layer.error = true;
            };
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept",M.mime+";projection="+layer.options.projection+";zoom="+layer.zoom);
            xhr.overrideMimeType("text/xml");
            xhr.send();
        }
        function _processMapMLFeedResponse(content) {
            var mapml = this.responseXML || content,
                i;
            if (mapml) {
              if (requestCounter === 0) {
                var serverExtent = mapml.querySelector('extent');
                if (!serverExtent) {
                    serverExtent = layer._synthesizeExtent(mapml);
                }
                  layer._extent = serverExtent;
                  // the serverExtent should be removed if necessary from layer._el before by _initEl
                  // BUG https://github.com/Maps4HTML/Web-Map-Custom-Element/issues/29
                  //layer._el.appendChild(document.importNode(serverExtent,true));
                  layer._parseLicenseAndLegend(mapml, layer);
              }
              if (mapml.querySelector('feature')) {
                  layer._mapmlvectors.addData(mapml);
              }
              if (mapml.querySelector('tile')) {
                  var tiles = document.createElement("tiles"),
                    zoom = mapml.querySelector('meta[name=zoom][content]') || mapml.querySelector('input[type=zoom][value]');
                  tiles.setAttribute("zoom", zoom.getAttribute('content') || zoom.getAttribute('value'));
                  var newTiles = mapml.getElementsByTagName('tile');
                  for (i=0;i<newTiles.length;i++) {
                      Polymer.dom(tiles).appendChild(document.importNode(newTiles[i], true));
                  }
                  layer._el.appendChild(tiles);
              }
              if (mapml.querySelector('image')) {
                  var images = mapml.getElementsByTagName('image'),
                      imageOverlays = [],
                      // need a reference to the _imageLayer container element to pass to children
                      // so they can append the img element they create to it.
                      container = layer._el.parentElement;
                  for (i=0;i<images.length;i++) {
                      var image = images[i],
                          src = image.getAttribute('src'),
                          map = layer._map,
                          // TODO when the image location is returned by the MapML
                          // document image element, use that location instead
                          // of map.getPixelBounds().min.  Also, read and use the
                          // angle of the image from the mapml//image element
                          // Currently, map.getPixelBounds() usage assumes that
                          // the returned image fills the extent of the mapml document
                          location = map.getPixelBounds().min.subtract(map.getPixelOrigin()),
                          size = map.getSize();
                          imageOverlays[i] = M.imageOverlay(src,location,size,/* angle */0,container);
                  }
                  var layersToRemove = layer._imageLayer.getLayers();
                  var last=imageOverlays.length-1; 
                  for (i=0;i < imageOverlays.length;i++) {
                    layer._imageLayer.addLayer(imageOverlays[i]);
                    if (i === last) {
                      imageOverlays[i].on('load', function(e) {
                        for (var i = 0;i < layersToRemove.length;i++) {
                          layer._imageLayer.removeLayer(layersToRemove[i]);
                        }
                      });
                    }
                  }
              }
              var next = _parseLink('next',mapml);
              if (next && requestCounter < layer.options.maxNext) {
                  requestCounter++;
                  _pull(next, _processMapMLFeedResponse);
              } else {
                  if (layer._el.getElementsByTagName('tile').length > 0) {
                      layer._tileLayer._onMapMLProcessed();
                  }
                  layer.fire('extentload', layer, true);
              }
            }
        }
        function _parseLink(rel, xml) {
            // depends on js-uri http://code.google.com/p/js-uri/ 
            // would be greate to depend on the URL standard and not a library
            var baseEl = xml.querySelector('base'), 
                base =  baseEl ? baseEl.getAttribute('href'):null,
                baseUri = new URI(base||xml.baseURI),
                link = xml.querySelector('link[rel='+rel+']'),
                relLink = link?new URI(link.getAttribute('href')).resolve(baseUri):null;
            return relLink;
        }
    },
    _createExtent: function () {
    
        var extent = document.createElement('extent'),
            xminInput = document.createElement('input'),
            yminInput = document.createElement('input'),
            xmaxInput = document.createElement('input'),
            ymaxInput = document.createElement('input'),
            zoom = document.createElement('input'),
            projection = document.createElement('input');
    
        zoom.setAttribute('type','zoom');
        zoom.setAttribute('min','0');
        zoom.setAttribute('max','0');
        
        xminInput.setAttribute('type','xmin');
        xminInput.setAttribute('min','');
        xminInput.setAttribute('max','');
        
        yminInput.setAttribute('type','ymin');
        yminInput.setAttribute('min','');
        yminInput.setAttribute('max','');
        
        xmaxInput.setAttribute('type','xmax');
        xmaxInput.setAttribute('min','');
        xmaxInput.setAttribute('max','');

        ymaxInput.setAttribute('type','ymax');
        ymaxInput.setAttribute('min','');
        ymaxInput.setAttribute('max','');
        
        projection.setAttribute('type','projection');
        projection.setAttribute('value','WGS84');
        
        extent.setAttribute('action','synthetic');
        Polymer.dom(extent).appendChild(xminInput);
        Polymer.dom(extent).appendChild(yminInput);
        Polymer.dom(extent).appendChild(xmaxInput);
        Polymer.dom(extent).appendChild(ymaxInput);
        Polymer.dom(extent).appendChild(zoom);
        Polymer.dom(extent).appendChild(projection);

        return extent;
    },
    _validateExtent: function () {
        var serverExtent = this._extent;
        if (!serverExtent || !serverExtent.querySelector || !this._map) {
            return;
        }
        if (serverExtent.querySelector('[type=xmin][min=""], [type=xmin][max=""], [type=xmax][min=""], [type=xmax][max=""], [type=ymin][min=""], [type=ymin][max=""]')) {
            var xmin = serverExtent.querySelector('[type=xmin]'),
                ymin = serverExtent.querySelector('[type=ymin]'),
                xmax = serverExtent.querySelector('[type=xmax]'),
                ymax = serverExtent.querySelector('[type=ymax]'),
                proj = serverExtent.querySelector('[type=projection][value]'),
                bounds, projection;
            if (proj) {
                projection = proj.getAttribute('value');
                if (projection && projection === 'WGS84') {
                    bounds = this._map.getBounds();
                    xmin.setAttribute('min',bounds.getWest());
                    xmin.setAttribute('max',bounds.getEast());
                    ymin.setAttribute('min',bounds.getSouth());
                    ymin.setAttribute('max',bounds.getNorth());
                    xmax.setAttribute('min',bounds.getWest());
                    xmax.setAttribute('max',bounds.getEast());
                    ymax.setAttribute('min',bounds.getSouth());
                    ymax.setAttribute('max',bounds.getNorth());
                } else if (projection) {
                    // needs testing.  Also, this will likely be
                    // messing with a server-generated extent.
                    bounds = this._map.getPixelBounds();
                    xmin.setAttribute('min',bounds.getBottomLeft().x);
                    xmin.setAttribute('max',bounds.getTopRight().x);
                    ymin.setAttribute('min',bounds.getTopRight().y);
                    ymin.setAttribute('max',bounds.getBottomLeft().y);
                    xmax.setAttribute('min',bounds.getBottomLeft().x);
                    xmax.setAttribute('max',bounds.getTopRight().x);
                    ymax.setAttribute('min',bounds.getTopRight().y);
                    ymax.setAttribute('max',bounds.getBottomLeft().y);
                }
            } else {
                this.error = true;
            }

        }
        if (serverExtent.querySelector('[type=zoom][min=""], [type=zoom][max=""]')) {
            var zoom = serverExtent.querySelector('[type=zoom]');
            zoom.setAttribute('min',this._map.getMinZoom());
            zoom.setAttribute('max',this._map.getMaxZoom());
        }
    },
    _getMapMLExtent: function (bounds, zooms, proj) {
        
        var extent = this._createExtent(),
            zoom = extent.querySelector('input[type=zoom]'),
            xminInput = extent.querySelector('input[type=xmin]'),
            yminInput = extent.querySelector('input[type=ymin]'),
            xmaxInput = extent.querySelector('input[type=xmax]'),
            ymaxInput = extent.querySelector('input[type=ymax]'),
            projection = extent.querySelector('input[type=projection]'),
            zmin = zooms[0] !== undefined && zooms[1] !== undefined ? Math.min(zooms[0],zooms[1]) : '',
            zmax = zooms[0] !== undefined && zooms[1] !== undefined ? Math.max(zooms[0],zooms[1]) : '',
            xmin = bounds ? bounds._southWest ? bounds.getWest() : bounds.getBottomLeft().x : '',
            ymin = bounds ? bounds._southWest ? bounds.getSouth() : bounds.getTopRight().y : '',
            xmax = bounds ? bounds._southWest ? bounds.getEast() : bounds.getTopRight().x : '',
            ymax = bounds ? bounds._southWest ? bounds.getNorth() : bounds.getBottomLeft().y : '';
    
        zoom.setAttribute('min', typeof(zmin) === 'number' && isNaN(zmin)? '' : zmin);
        zoom.setAttribute('max', typeof(zmax) === 'number' && isNaN(zmax)? '' : zmax);
        
        xminInput.setAttribute('min',xmin);
        xminInput.setAttribute('max',xmax);
        
        yminInput.setAttribute('min',ymin);
        yminInput.setAttribute('max',ymax);
        
        xmaxInput.setAttribute('min',xmin);
        xmaxInput.setAttribute('max',xmax);

        ymaxInput.setAttribute('min',ymin);
        ymaxInput.setAttribute('max',ymax);
        
        projection.setAttribute('value',bounds && bounds._southWest && !proj ? 'WGS84' : proj);

        return extent;
    },
    _synthesizeExtent: function (mapml) {
        var metaZoom = mapml.querySelectorAll('meta[name=zoom]')[0],
            metaExtent = mapml.querySelector('meta[name=extent]'),
            metaProjection = mapml.querySelector('meta[name=projection]'),
            proj = metaProjection ? metaProjection.getAttribute('content'): 'WGS84',
            i,expressions,bounds,zmin,zmax,xmin,ymin,xmax,ymax,expr,lhs,rhs;
        if (metaZoom) {
            expressions = metaZoom.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'min') {
                zmin = parseInt(rhs);
              }
              if (lhs === 'max') {
                zmax = parseInt(rhs);
              }
            }
        }  
        if (metaExtent) {
            expressions = metaExtent.getAttribute('content').split(',');
            for (i=0;i<expressions.length;i++) {
              expr = expressions[i].split('=');
              lhs = expr[0];
              rhs=expr[1];
              if (lhs === 'xmin') {
                xmin = parseFloat(rhs);
              }
              if (lhs === 'xmax') {
                xmax = parseFloat(rhs);
              }
              if (lhs === 'ymin') {
                ymin = parseFloat(rhs);
              }
              if (lhs === 'ymax') {
                ymax = parseFloat(rhs);
              }
            }
        }
        if (xmin && ymin && xmax && ymax && proj === 'WGS84') {
            var sw = L.latLng(ymin,xmin), ne = L.latLng(ymax,xmax);
            bounds = L.latLngBounds(sw,ne);
        } else if (xmin && ymin && xmax && ymax) {
            // needs testing
            bounds = L.bounds([[xmin,ymin],[xmax,ymax]]);
        }
        return this._getMapMLExtent(bounds, [zmin,zmax], proj);
    },
    // a layer must share a projection with the map so that all the layers can
    // be overlayed in one coordinate space.  WGS84 is a 'wildcard', sort of.
    getProjection: function () {
        if (!this._extent || !this._extent.querySelector('input[type=projection]')) return 'WGS84';
        var projection = this._extent.querySelector('input[type=projection]');
        if (!projection.getAttribute('value')) return 'WGS84';
        return projection.getAttribute('value');
    },
    _parseLicenseAndLegend: function (xml, layer) {
        var licenseLink =  xml.querySelector('link[rel=license]'), licenseTitle, licenseUrl, attText;
        if (licenseLink) {
            licenseTitle = licenseLink.getAttribute('title');
            licenseUrl = licenseLink.getAttribute('href');
            attText = '<a href="' + licenseUrl + '" title="'+licenseTitle+'">'+licenseTitle+'</a>';
        }
        L.setOptions(layer,{attribution:attText});
        var legendLink = xml.querySelector('link[rel=legend]');
        if (legendLink) {
          layer._legendUrl = legendLink.getAttribute('href');
        }
    },
    _onMoveEnd: function () {
        // this can only be done when the layer is on a map, because the url
        // calculation requires to process the extent of the map through the 
        // extent form that should have already been received.
        var url =  this._calculateUrl();
        if (url) {
            this.href = url;
            this.fire('loadstart');
            this._mapmlvectors.clearLayers();
            this._initEl();
            this._getMapML(url);
        } else if (this._content && !this._mapmlvectors.getLayers().length) {
            // if the content hasn't been parsed yet, parse it into vectors,
            // images and tiles, if applicable
            // 
            // this shouldn't only be contingent on vectors - could be other stuff
            // located in this._content that has been parsed, so it should be 
            // generalized to be: if (this._content && !vectors && !images && !tiles)
            // tiles could be = Object.keys($0._layer._tileLayer._tiles).length
            // images = not sure yet. NOT FINISHED.
            // vectors = this._mapmlvectors.getLayers().length
            this._getMapML(null);
        }
    },
    _initEl: function () {
        if (!this._el) {return;}
        var container = this._el;
        while (container.firstChild)
            container.removeChild(container.firstChild);
    },
    _reset: function() {
        this._initEl();
        this._mapmlvectors.clearLayers();
        //this._map.removeLayer(this._mapmlvectors);
        return;
    },
    // return the LatLngBounds of the map unprojected such that the whole
    // map is covered, not just a band defined by the projected map bounds.
    _getUnprojectedMapLatLngBounds: function(map) {
      
          map = map||this._map; 
          origin = map.getPixelOrigin();
          bounds = map.getPixelBounds();
          nw = map.unproject(origin);
          sw = map.unproject(bounds.getBottomLeft());
          ne = map.unproject(bounds.getTopRight());
          se = map.unproject(origin.add(map.getSize()));
          return L.latLngBounds(sw,ne).extend(se).extend(nw);
    },
    _calculateUrl: function() {
        
        if (!this._map) return null;
        if (!this._el && !this._extent) return this._href;
        var extent = this._el.getElementsByTagName('extent')[0] || this._extent;
        if (!extent) return this._href;
        var action = extent.getAttribute("action");
        if (!action || action === "synthetic") return null;
        var b,
            projection = extent.querySelectorAll('input[type=projection]')[0],
            projectionValue = projection.getAttribute('value');
        
        // if the mapml extent being processed is WGS84, we need to speak in those units
        if (projectionValue === 'WGS84') {
            b = this._getUnprojectedMapLatLngBounds();
        } else {
            // otherwise, use the bounds of the map
            b = this._map.getPixelBounds();
        }
        
        // retrieve the required extent inputs by type
        var xmin = extent.querySelectorAll("input[type=xmin]")[0],
            ymin = extent.querySelectorAll("input[type=ymin]")[0],
            xmax = extent.querySelectorAll("input[type=xmax]")[0],
            ymax = extent.querySelectorAll("input[type=ymax]")[0];
        
        // if even one of them doesn't exist, we're snookered
        if (!xmin|| !ymin || !xmax || !ymax ) return  null;
        
        // use the @name as the name of the variable to transmit, or the @type value by default
        var xminName = (xmin.getAttribute('name')?xmin.getAttribute('name').trim():'xmin');
        var yminName = (ymin.getAttribute('name')?ymin.getAttribute('name').trim():'ymin');
        var xmaxName = (xmax.getAttribute('name')?xmax.getAttribute('name').trim():'xmax');
        var ymaxName = (ymax.getAttribute('name')?ymax.getAttribute('name').trim():'ymax');
        
        // generate a URI template for the extent request using the variable names above
        var bboxTemplate = "";
        bboxTemplate += xminName + "={" + xminName + "}" + "&";
        bboxTemplate += yminName + "={" + yminName + "}" + "&";
        bboxTemplate += xmaxName + "={" + xmaxName + "}" + "&";
        bboxTemplate += ymaxName + "={" + ymaxName + "}";
        
        // establish the range of zoom values for the extent
        var zoom = extent.querySelectorAll("input[type=zoom]")[0];
        if ( !zoom || !projection) return null;

        var min = parseInt(zoom.getAttribute("min")),
            max = parseInt(zoom.getAttribute("max")),
            values = {}, // the values object will contain the values for the URI template
            mapZoom = this._map.getZoom();
        // check that the zoom of the map is in the range of the zoom of the service
        if ( min <= mapZoom && mapZoom <= max) {
          values.zoom = mapZoom;
        } else {
          return null;
        }
        
        var zoomName = zoom.getAttribute('name')?zoom.getAttribute('name').trim():'zoom';
        var zoomTemplate = zoomName + "={" + zoomName + "}";

        values.xmin = b.min?b.min.x:b.getWest();
        values.ymin = b.min?b.min.y:b.getSouth();
        values.xmax = b.max?b.max.x:b.getEast();
        values.ymax = b.max?b.max.y:b.getNorth();
        values.projection = projectionValue;
        
        var projectionName = projection.getAttribute('name')?projection.getAttribute('name').trim():'projection';
        var projectionTemplate = projectionName + "={" + projectionName + "}";
        
        var requestTemplate = bboxTemplate + "&" + zoomTemplate + "&" + projectionTemplate,
            base = new URI(this._href);
        action += ((action.search(/\?/g) === -1) ? "?" : "&") + requestTemplate;
        var rel = new URI(action).resolve(base).toString();
        return L.Util.template(rel, values);
    },
    // this takes into account that WGS84 is considered a wildcard match.
    _projectionMatches: function(map) {
        map = map||this._map;
        var projection = this.getProjection();
        if (!map.options.projection || projection !== 'WGS84' && map.options.projection !== projection) return false;
        return true;
    }
});
M.mapMLLayer = function (url, node, options) {
	return new M.MapMLLayer(url, node ? node : document.createElement('div'), options);
};
M.MapMLTileLayer = L.TileLayer.extend({
        // override the function of the same name defined in L.GridLayer
	getEvents: function () {
		var events = {};
                // doing updates on move causes too much jank...
		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},
	_onMapMLProcessed: function () {
            if (!this._map) { return; }
            if (L.DomUtil.hasClass(this._map.getPane('mapPane'),'leaflet-zoom-anim')) { return; }

            this._update();
	},
        _update: function(center, zoom) {
            var map = this._map;
            if (!map) { return; }
            if (L.DomUtil.hasClass(map.getPane('mapPane'),'leaflet-zoom-anim')) { return; }

            if (center === undefined) { center = map.getCenter(); }
            if (zoom === undefined) { zoom = map.getZoom(); }
            var tileZoom = Math.round(zoom);

            if (tileZoom > this.options.maxZoom ||
                    tileZoom < this.options.minZoom) { return; }

            var pixelBounds = this._getTiledPixelBounds(center, zoom, tileZoom),
                tileRange = this._pxBoundsToTileRange(pixelBounds);

            /* Need to group / create arrays of tile elements grouped by
             * row & col values, then pass each array of tile elements to
             * the _addTile function, so that a MapML server may serve a set
             * of tile elements for each tile AND so that a MapML server
             * can rotate URLs for a single image over several servers per the
             * mechanism described by 
             * http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
             * 
             * Also, it should be possible for a MapML server to serve several
             * tile elements for a single tile row/col, such that the images
             * 'stack' to form a composite image.  Such URLs would necessarily
             * be different, so that should be permitted by the grouping.
             * */
            var tiles = this._groupTiles(this._el.getElementsByTagName('tile'));
            for (var key in this._tiles) {
                this._tiles[key].current = false;
            }
            // if the coordinates of a tile in the new pixelBounds are already in the
            // existing set of loaded tiles, exclude it from being re-created
            for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
                for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                    var coords = new L.Point(i, j);
                    coords.z = tileZoom;

                    if (!this._isValidTile(coords)) { continue; }

                    var tile = this._tiles[this._tileCoordsToKey(coords)];
                    if (tile) {
                        tile.current = true;
                        for (var k=0; k<tiles.length; k++) { 
                          if (tiles[k][0].row === tile.coords.y && tiles[k][0].col === tile.coords.x) { 
                            tiles.splice(k,1);
                            continue;
                          }
                        }
                    }
                }
            }
            
            if (!tiles.length) { return; }
            this.once('load', this._pruneTiles);
            this._addTiles(tiles);
        },
        _groupTiles: function (tiles) {
            var tileArray = [];
            for (var i=0;i<tiles.length;i++) {
              var tile = {};
              tile.row = parseInt(tiles[i].getAttribute('row'));
              tile.col = parseInt(tiles[i].getAttribute('col'));
              tile.src = tiles[i].getAttribute('src');
              tileArray.push(tile);
            }
            return groupBy(tileArray, function(item) { return[item.row, item.col]; });
            function groupBy( array , f ) {
                var groups = {};
                array.forEach( function( o ) {
                  var group = JSON.stringify( f(o) );
                  groups[group] = groups[group] || [];
                  groups[group].push( o );  
                });
                return Object.keys(groups).map( function( group ) {
                  return groups[group]; 
                });
            }
        },
	_addTiles: function (tiles) { // tiles is an array of arrays, representing tile image URLs grouped by shared row/col
		var queue = [], group = {};
                for (var i=0;i<tiles.length;i++) {
                    group.col = tiles[i][0].col;
                    group.row = tiles[i][0].row;
                    if (this._isValidTile(new L.Point(group.col, group.row))) {
                        queue.push(tiles[i]);
                    }
                }

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._loading) {
                    this._loading = true;
                    this.fire('loading');
		}

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		Polymer.dom(this._level.el).appendChild(fragment);
	},
	_addTile: function (groupToLoad, container) {
                // tiles have been grouped by row/col, so all members of the array
                // share those values.
		var coords = new L.Point(groupToLoad[0].col, groupToLoad[0].row);
                coords.z = this._map.getZoom();
                var key = this._tileCoordsToKey(coords);
                var tile;
                
                for (var i=0;i<groupToLoad.length;i++) {
                    // create an img element for each tile element for this grid cell
                    tile = this.createTile(groupToLoad[i].src, L.bind(this._tileReady, this, coords));
                    this._initTile(tile);
                    //setTimeout(L.bind(this._tileReady, this, coords, null, tile), 0);
                    groupToLoad[i].img = tile;
                }

                var tileContainer;
                if (this._tiles[key]) {
                  tileContainer = this._tiles[key].el;
                } else {
                  tileContainer = document.createElement('div');
                  L.DomUtil.addClass(tileContainer, 'leaflet-tile');
                    for (i=0;i<groupToLoad.length;i++) {
                        Polymer.dom(tileContainer).appendChild(groupToLoad[i].img);
                    }
                }
                // per L.TileLayer comment:
		// we prefer top/left over translate3d so that we don't create a HW-accelerated layer from each tile
		// which is slow, and it also fixes gaps between tiles in Safari
                L.DomUtil.setPosition(tileContainer, this._getTilePos(coords));

		// save tile in cache
		this._tiles[key] = {
			el: tileContainer,
			coords: coords,
			current: true
		};
                // append the tile container div to the container fragment
		Polymer.dom(container).appendChild(tileContainer);
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},
        // override Leaflet method of the same name, removing the 'leaflet-tile' 
        // class assignment from img elements because that class is on the parent 
        // div element (mapml layers can have > 1 img per tile).
	_initTile: function (tile) {
		// L.DomUtil.addClass(tile, 'leaflet-tile');

		var tileSize = this.getTileSize();
		tile.style.width = tileSize.x + 'px';
		tile.style.height = tileSize.y + 'px';

		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.android && !L.Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},
        // override the private method from L.GridLayer, adapt to the mapml situation
	_noTilesToLoad: function () {
                for (var key in this._tiles) {
                    if (!L.DomUtil.hasClass(this._tiles[key].el, 'leaflet-tile-loaded')) { return false; }
                }
                return true;
	},
	createTile: function (src, done) {
		var tile = document.createElement('img');

		tile.onload = L.bind(this._tileOnLoad, this, done, tile);
		tile.onerror = L.bind(this._tileOnError, this, done, tile);
                
		if (this.options.crossOrigin) {
			tile.crossOrigin = '';
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		tile.src = src;
//                L.DomUtil.addClass(tile, 'leaflet-tile-loaded');

		return tile;
	},
        _tileLoad: function(tile) {
          if (!tile) { return; }
          var images = tile.querySelectorAll('img'),
              allImagesLoaded = true;
          
          for (var i=0;i<images.length;i++) {
              
            if (!images[i].loaded) {
                allImagesLoaded = false;
            }
          }
          if (allImagesLoaded) {
              L.DomUtil.addClass(tile, 'leaflet-tile-loaded');
          }
        },
        // stops loading all tiles in the background layer, overrides method
        // from L.TileLayer because of different HTML model img -> div/img[]
	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			var tileDiv = this._tiles[i].el,
                            images = tileDiv.getElementsByTagName('img');
                        for (i = 0; i< images.length; i++) {
                            tile = images[i];
                            tile.onload = L.Util.falseFn;
                            tile.onerror = L.Util.falseFn;

                            if (!tile.complete) {
                                    tile.src = L.Util.emptyImageUrl;
                                    L.DomUtil.remove(tile);
                            }
                        }
		}
	}
});

M.mapMLTileLayer = function (url, options) {
	return new M.MapMLTileLayer(url, options);
};
M.MapMLTileLayer.addInitHook(function () {
    this.on('tileload', function (e) {
        var img = e.tile;
        this._tileLoad(img);
    }, this);
});

/*
 * M.MapML turns any MapML feature data into a Leaflet layer. Based on L.GeoJSON.
 */

M.MapMLFeatures = L.FeatureGroup.extend({
	initialize: function (mapml, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (mapml) {
			this.addData(mapml);
		}
	},

	addData: function (mapml) {
		var features = mapml.nodeType === Node.DOCUMENT_NODE || mapml.nodeName === "LAYER-" ? mapml.getElementsByTagName("feature") : null,
		    i, len, feature;
            
                var stylesheet = mapml.nodeType === Node.DOCUMENT_NODE ? mapml.querySelector("link[rel=stylesheet]") : null;
                if (stylesheet) {
                  
                    var baseEl = mapml.querySelector('base'),
                          base = new URI(baseEl?baseEl.getAttribute('href'):mapml.baseURI),
                          link = new URI(stylesheet.getAttribute('href'));
                          stylesheet = link.resolve(base).toString();
                }
                if (stylesheet) {
                  if (!document.head.querySelector("link[href='"+stylesheet+"']")) {
                    var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "link");
                    linkElm.setAttribute("href", stylesheet);
                    linkElm.setAttribute("type", "text/css");
                    linkElm.setAttribute("rel", "stylesheet");
                    document.head.appendChild(linkElm);
                  }
                }

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry is set and not null
				feature = features[i];
                                var geometriesExist = feature.getElementsByTagName("geometry").length && feature.getElementsByTagName("coordinates").length;
				if (geometriesExist) {
					this.addData(feature);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(mapml)) { return; }

		var layer = M.MapMLFeatures.geometryToLayer(mapml, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = mapml.getElementsByTagName('properties')[0];
                
                layer.options.className = mapml.getAttribute('class') ? mapml.getAttribute('class') : null;
		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(layer.feature, layer);
		}

		return this.addLayer(layer);
	},
        
	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(M.MapMLFeatures, {
	geometryToLayer: function (mapml, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = mapml.tagName.toUpperCase() === 'FEATURE' ? mapml.getElementsByTagName('geometry')[0] : mapml,
		    coords = geometry.getElementsByTagName('coordinates'),
		    layers = [],
		    latlng, latlngs, i, coordinates;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.firstElementChild.tagName.toUpperCase()) {
		case 'POINT':
                        coordinates = [];
                        coords[0].textContent.split(/\s+/gi).forEach(parseNumber,coordinates);
			latlng = coordsToLatLng(coordinates);
                        
                        var pathToImages = L.Icon.Default.imagePath + "/";
                        var opacity = vectorOptions.opacity ? vectorOptions.opacity : null;
			return pointToLayer ? pointToLayer(mapml, latlng) : 
                                new L.Marker(latlng, {opacity: opacity, icon: L.icon({
                                    iconUrl: pathToImages+"marker-icon.png",
                                    iconRetinaUrl: pathToImages+"marker-icon-2x.png",
                                    shadowUrl: pathToImages+"marker-shadow.png",
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]})});

		case 'MULTIPOINT':
                        throw new Error('Not implemented yet');
//			for (i = 0, len = coords.length; i < len; i++) {
//				latlng = coordsToLatLng(coords[i]);
//				layers.push(pointToLayer ? pointToLayer(mapml, latlng) : new L.Marker(latlng));
//			}
//			return new L.FeatureGroup(layers);

		case 'LINESTRING':
                        coordinates = [];
                        coords[0].textContent.match(/(\S+ \S+)/gi).forEach(splitCoordinate, coordinates);
			latlngs = this.coordsToLatLngs(coordinates, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'POLYGON':
                        coordinates = new Array(coords.length);
                        for (i=0;i<coords.length;i++) {
                          coordinates[i]=[];
                          coords[i].textContent.match(/(\S+ \S+)/gi).forEach(splitCoordinate, coordinates[i]);
                        }
			latlngs = this.coordsToLatLngs(coordinates, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);
		case 'MULTILINESTRING':
                        throw new Error('Not implemented yet');
//			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
//			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MULTIPOLYGON':
                        throw new Error('Not implemented yet');
//			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
//			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GEOMETRYCOLLECTION':
                        throw new Error('Not implemented yet');
//			for (i = 0, len = geometry.geometries.length; i < len; i++) {
//
//				layers.push(this.geometryToLayer({
//					geometry: geometry.geometries[i],
//					type: 'Feature',
//					properties: geojson.properties
//				}, pointToLayer, coordsToLatLng, vectorOptions));
//			}
//			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}

                function splitCoordinate(element, index, array) {
                  var a = [];
                  element.split(/\s+/gi).forEach(parseNumber,a);
                  this.push(a);
                }

                function parseNumber(element, index, array) {
                  this.push(parseFloat(element));
                }
        },
        

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.MapML.latLngToCoords(latLngs[i]));
		}

		return coords;
	}
});
 
M.mapMlFeatures = function (mapml, options) {
	return new M.MapMLFeatures(mapml, options);
};


/* removes 'base' layers as a concept */
M.MapMLLayerControl = L.Control.Layers.extend({
    initialize: function (overlays, options) {
        L.setOptions(this, options);
        
        // the _layers array contains objects like {layer: layer, name: "name", overlay: true}
        // the array index is the id of the layer returned by L.stamp(layer) which I guess is a unique hash
        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        for (var i in overlays) {
                this._addLayer(overlays[i], i, true);
        }
    },
    onAdd: function () {
        this._initLayout();
        this._map.on('moveend', this._validateExtents, this);
        this._update();
        this._validateExtents();
        return this._container;
    },
    onRemove: function (map) {
        map.off('moveend', this._validateExtents, this);
        // remove layer-registerd event handlers so that if the control is not
        // on the map it does not generate layer events
        for (var i in this._layers) {
          this._layers[i].layer.off('add remove', this._onLayerChange, this);
          this._layers[i].layer.off('extentload', this._validateExtents, this);
        }
    },
    _validateExtents: function (e) {
        // get the bounds of the map in Tiled CRS pixel units
        var zoom = this._map.getZoom(),
            bounds = this._map.getPixelBounds(),
            zoomBounds, i, obj, visible, projectionMatches;
        for (i in this._layers) {
            obj = this._layers[i];
            if (obj.layer._extent || obj.layer.error) {

                // get the 'bounds' of zoom levels of the layer as described by the server
                zoomBounds = obj.layer.getZoomBounds();
                projectionMatches = obj.layer._projectionMatches(this._map);
                visible = projectionMatches && this._withinZoomBounds(zoom, zoomBounds) && bounds.intersects(obj.layer.getLayerExtentBounds(this._map)) ;
                if (!visible) {
                    obj.input.disabled = true;
                    if (!projectionMatches) {
                        this._map.removeLayer(obj.layer);
                        obj.input.disabled = true;
                        obj.input.checked = false;
                    }
                    obj.input.nextElementSibling.style.fontStyle = 'italic';
                } else {
                    obj.input.disabled = false;
                    obj.input.style = null;
                    // ie does not work with null 
                    obj.input.nextElementSibling.style.fontStyle = '';
                }
                this._setLegendLink(obj,obj.input.nextElementSibling);
            }
        }
    },
    _withinZoomBounds: function(zoom, range) {
        return range.min <= zoom && zoom <= range.max;
    },
    _setLegendLink: function (obj, span) {
        if (obj.layer._legendUrl) {
            var legendLink = document.createElement('a');
            legendLink.text = ' ' + obj.name;
            legendLink.href = obj.layer._legendUrl;
            legendLink.target = '_blank';
            span.innerHTML = '';
            span.appendChild(legendLink);
        } else {
            span.innerHTML = ' ' + obj.name;
        }
    },
    _addItem: function (obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
        obj.input = input;

        input.layerId = L.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        
        this._setLegendLink(obj, name);
        Polymer.dom(label).appendChild(input);
        Polymer.dom(label).appendChild(name);

        var container = this._overlaysList;
        Polymer.dom(container).appendChild(label);
        // this is necessary because when there are several layers in the
        // layer control, the response to the last one can be a long time
        // after the info is first displayed, so we have to go back and
        // verify the extent and legend for the layer to know whether to
        // disable it , add the legend link etc.
        obj.layer.on('extentload', this._validateExtents, this);

        return label;
    }
});
M.mapMlLayerControl = function (layers, options) {
	return new M.MapMLLayerControl(layers, options);
};


}(window, document));