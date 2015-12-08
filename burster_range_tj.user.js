// ==UserScript==
// @id             iitc-plugin-burster-range@tj
// @name           IITC plugin: Burster range
// @category       OP Support
// @version        0.0.1.20151208.2036
// @namespace      https://github.com/foxxtj/iitc-plugins
// @updateURL      https://github.com/foxxtj/iitc-plugins/burster_range_tj.js
// @downloadURL    https://github.com/foxxtj/iitc-plugins/burster_range_tj.js
// @description    Burster range plugin for IITC
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () {
    };

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    // plugin_info.buildName = 'jonatkins';
    // plugin_info.dateTimeVersion = '';
    // plugin_info.pluginId = '';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.bursterRange = function () {};
    window.plugin.bursterRange.bursterLayers = {};
    window.plugin.bursterRange.MIN_MAP_ZOOM = 16;

    window.plugin.bursterRange.portalAdded = function(data) {
        data.portal.on('add', function() {
            window.plugin.bursterRange.draw(this.options.guid);
        });

        data.portal.on('remove', function() {
            window.plugin.bursterRange.remove(this.options.guid);
        });
    };

    window.plugin.bursterRange.remove = function(guid) {
        var previousLayer = window.plugin.bursterRange.bursterLayers[guid];
        if(previousLayer) {
            window.plugin.bursterRange.bursterCircleHolderGroup.removeLayer(previousLayer);
            delete window.plugin.bursterRange.bursterLayers[guid];
        }
    };

    window.plugin.bursterRange.draw = function(guid) {
        var d = window.portals[guid];

        var coo = d._latlng;
        var latlng = new L.LatLng(coo.lat,coo.lng);
        var optCircle = {color:'grey',opacity:0.7,fillColor:'grey',fillOpacity:0.1,weight:1,clickable:false, dashArray: [10,6]};
        var range = 168;

        var circle = new L.Circle(latlng, range, optCircle);

        circle.addTo(window.plugin.bursterRange.bursterCircleHolderGroup);

        window.plugin.bursterRange.bursterLayers[guid] = circle;

    };
    
    window.plugin.bursterRange.showOrHide = function() {
        if(map.getZoom() >= window.plugin.bursterRange.MIN_MAP_ZOOM) {
            // show the layer
            if(!window.plugin.bursterRange.bursterLayerHolderGroup.hasLayer(window.plugin.bursterRange.bursterCircleHolderGroup)) {
                window.plugin.bursterRange.bursterLayerHolderGroup.addLayer(window.plugin.bursterRange.bursterCircleHolderGroup);
                $('.leaflet-control-layers-list span:contains("Burster Range")').parent('label').removeClass('disabled').attr('title', '');
            }
        } else {
            // hide the layer
            if(window.plugin.bursterRange.bursterLayerHolderGroup.hasLayer(window.plugin.bursterRange.bursterCircleHolderGroup)) {
                window.plugin.bursterRange.bursterLayerHolderGroup.removeLayer(window.plugin.bursterRange.bursterCircleHolderGroup);
                $('.leaflet-control-layers-list span:contains("Burster Range")').parent('label').addClass('disabled').attr('title', 'Zoom in to show those.');
            }
        }
    };

    // The entry point for this plugin.
    function setup() {
        // this layer is added to the layer chooser, to be toggled on/off
        window.plugin.bursterRange.bursterLayerHolderGroup = new L.LayerGroup();

        // this layer is added into the above layer, and removed from it when we zoom out too far
        window.plugin.bursterRange.bursterCircleHolderGroup = new L.LayerGroup();

        window.plugin.bursterRange.bursterLayerHolderGroup.addLayer(window.plugin.bursterRange.bursterCircleHolderGroup);

        window.addLayerGroup('Burster Range', window.plugin.bursterRange.bursterLayerHolderGroup, true);

        window.addHook('portalAdded', window.plugin.bursterRange.portalAdded);

        map.on('zoomend', window.plugin.bursterRange.showOrHide);

        window.plugin.bursterRange.showOrHide();

    }

    // PLUGIN END //////////////////////////////////////////////////////////


    setup.info = plugin_info; //add the script info data to the function as a property

    // Make sure window.bootPlugins exists and is an array
    if (!window.bootPlugins) window.bootPlugins = [];
    // Add our startup hook
    window.bootPlugins.push(setup);
    // If IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();

} // wrapper end

// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);