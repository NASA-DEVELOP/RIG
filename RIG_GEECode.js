/*
*Script: Rainfall Intensity Graphs (RIG) v.1.0
*/


//Import Dataset (can be GPM, TRMM, or PRISM)
//To change dataset first replace the default ImageCollection ID for GPM with TRMM: 'TRMM/3B42' or PRISM: 'OREGONSTATE/PRISM/AN81d'
//Next replace all "GPM" with "TRMM" or "PRISM"
//Finally replace all "IRprecipitation" with "precipitation" for TRMM or "ppt" for PRISM

//Default ImageCollection ID for GPM - IMPORT
var GPM = ee.ImageCollection('NASA/GPM_L3/IMERG_V05');


//Build geometry polygons for clipping dataset 
var Area = ee.Geometry.Polygon([
  [[-110.57121276855469,36.79169061907076], [-110.56915283203125,36.63701909682385], 
  [-110.38719177246094,36.63867203824882], [-110.38581848144531,36.793340236044536],
  [-110.57121276855469,36.79169061907076], [-110.08292198443087,36.52805313685172],
  [-110.08253574633272,36.52760482676665], [-110.08199930452975,36.52794968090885],
  [-110.0820636775461,36.528329018689554], [-110.08260011934908,36.52834626127172],
  [-110.08277178072603,36.528225563115676], [-110.08292198443087,36.52805313685172]]
  ]);

var region = ee.Geometry.Polygon([
  [[-110.08244991269748,36.5281481497273], [-110.08277177777927,36.52794985929219], [-110.08242845502537,36.52757051965205],
  [-110.08194565740268,36.52781191782011], [-110.08199930158298,36.52806193655711], [-110.08244991269748,36.5281481497273]]
  ]);
  
  
//Create the application for filtering date
var app = {};

//creating the ui panel

app.createPanels = function(){

  //intro panel creation
  
  app.intro = {
    panel: ui.Panel([
      ui.Label({
        value: 'GPM Virtual Rain Gauge',
        style: {fontWeight:'bold', fontSize:'20px', margin:'10px 5 px'}
      }),
      ui.Label('This application creates virtual rain gauges from the GPM dataset.'),
      ui.Label(' 1.) Type in your year-month-day time period of interest and then push [Execute].'),
      ui.Label('2.) Wherever you click a chart showing the IR precipitation intensity based on the selected GPM pixel is created.'),
      ui.Label('3.) If you would like to create a map showing the average rainfall for the time period of interest then push the [Make Map] button.'),
      ])
  };

  
  //filter controls setup
  
  app.filters = {
    startDate: ui.Textbox('YYYY-MM-DD', '2014-08-01'),
    endDate: ui.Textbox('YYYY-MM-DD','2014-09-01'),
    applybutton: ui.Button('Execute', app.applyFilters),
    mapbutton: ui.Button('Make Map',app.createMap),
    
    
    //chartButton: ui.Button('Make chart', app.makechart)
    
    loadingLabel: ui.Label({
      value:'Loading now....',
      style: {stretch: 'vertical', color:'gray', shown:false}
    })
  };
  
  
  //filter date panel 
  
  app.filters.panel = ui.Panel({
    widgets:[
      ui.Label('Date Range (YYYY-MM-DD)', {fontWeight:'bold'}),
      ui.Label('Start Date', app.HELPER_TEXT_STYLE), app.filters.startDate,
      ui.Label('End Date', app.HELPER_TEXT_STYLE), app.filters.endDate,
      ui.Panel([
        app.filters.applybutton,
        app.filters.mapbutton,
        
       // app.filters.chartButton,
       
        app.filters.loadingLabel
      ], ui.Panel.Layout.flow('horizontal'))
    ],
    style: app.SECTION_STYLE
  });
};

//creating function w/in function eliminates bugs

app.create = function(){
  
  //enables loading mode
  
  app.setLoadingMode = function(enabled){
    
    //enabled mode
    
    app.filters.loadinglabel.set('shown',enabled);
    
    //dependent widgets to run
    
    var loadDependedntWidgets = [
      app.filters.startDate,
      app.filters.endDate,
      app.filters.applyButton,
    ];
    loadDependedntWidgets.forEach(function(widget){
      widget.setDisabled(enabled);
    });
  };
  
  //applies the filters that was input by the user
  
  app.applyFilters = function(){
    
    //app.setLoadingMode(true);
    
    var filtered = ee.ImageCollection(app.COLLECTION_ID);
  
  //filter the bounds to NAVA Area
  
    filtered = filtered.filterBounds(Area);
    
  //set filter varibles
  
    var start = app.filters.startDate.getValue();
    if (start) start = ee.Date(start);
    var end = app.filters.endDate.getValue();
    if (end) end = ee.Date(end);
    if (start) filtered = filtered.filterDate(start, end);
    
  //print values to make sure all is well
  
    print(filtered);
    
  //Refresh the map when execute happens
  
  };

  app.createMap = function(){
    
    //Map.clear();
    //Map.addLayer(Country);
    
    var imageId = GPM.filterDate(app.filters.startDate.getValue(),app.filters.endDate.getValue());
    if(imageId){
      
      //if found create layer
      
      var image = ee.ImageCollection(GPM).filterDate(app.filters.startDate.getValue(),app.filters.endDate.getValue()).select('IRprecipitation').filterBounds(region);
      var visParams = {min: 0, max: 2, palette : ['#b2adac', '#00c3ff', '#0199f3', '#006cf3', '#0028f3'], opacity: .4};
      Map.addLayer(image, visParams, 'GPM IR Precipitation Map');
    }
    
    // set position of panel
    
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
 
// Create legend title

var legendTitle = ui.Label({
  value: 'Precipitation Intensity',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});
 
// Add the title to the panel

legend.add(legendTitle);
 
// Creates and styles 1 row of the legend.

var makeRow = function(color, name) {
 
      // Create the label that is actually the colored box.
      
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          
          // Use padding to give the box height and width.
          
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
 
      // Create the label filled with the description text.
      
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      // return the panel
      
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};
 
//  Palette with the colors

var palette =['b2adac', '00c3ff', '0199f3', '006cf3', '0028f3'];
 
// name of the legend

var names = ['very light','light','moderate', 'heavy', 'very heavy'];
 
// Add color and and names

for (var i = 0; i < 5; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  
 
// add legend to map (alternatively you can also print the legend to the console)

Map.add(legend)};

  app.createClick = function(){
    Map.onClick(function(coords) {
       var panel1 = ui.Panel();
        panel1.style().set({
        width: '800px',
        position: 'bottom-right'
        });
       Map.add(panel1);
      
      //set chart display
      
      var option ={
        title: 'GPM IR Precipitation Intensity Over Time',
        hAxis: {title:'time (months)'},
        vAxis: {title:'precip. rate (mm/hr)'}
      };
      
      //panel1.clear();
      
      var startyear = app.filters.startDate.getValue();
      var endyear = app.filters.endDate.getValue();
      print("in chart",startyear,endyear)
      var point = ee.Geometry.Point(coords.lon, coords.lat);
      
      //added startyear and endyear ^ then filtered it V now the chart doesn't time out looking at everyimage in time.
      
      var chart = ui.Chart.image.series(ee.ImageCollection(GPM).filterDate(startyear,endyear).select('IRprecipitation'), point, ee.Reducer.mean(),300);
      chart.setOptions(option);
      panel1.add(chart);
  });
  };
};

//Forming the GPM constant to take values from

app.createConstants = function(){
  app.COLLECTION_ID = GPM.select('IRprecipitation');
    app.SECTION_STYLE = {margin: '20px 0 0 0'};
  app.HELPER_TEXT_STYLE = {
    margin: '8px 0 -3px 8px',
    fontSize: '12px',
    color: 'gray'
  };
}

//Boot the application and create the interface table

app.boot = function() {
  app.createConstants();
  app.create();
  app.createPanels();
  app.createClick();
  var main = ui.Panel({
    widgets: [
      app.intro.panel,
      app.filters.panel
    ],
    style: {width:'320px', padding: '8px'}
  });
  Map.setCenter(-110.3, 36.7, 11);
  ui.root.insert(0, main);
  app.applyFilters();
};

app.boot();