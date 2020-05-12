var edu='https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
var count='https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

let xml= new XMLHttpRequest()
xml.open('GET',edu,true)
xml.send()
xml.onload=()=>{
var education=JSON.parse(xml.responseText)    
let xmm= new XMLHttpRequest()
xmm.open('GET',count,true)
xmm.send()
xmm.onload=()=>{
var us=JSON.parse(xmm.responseText)
//basic dimension
var padding=50;
var w=1050;
var h=950;
//console.log(json2)
var tooltip = d3.select(".let").append("div").attr("id", "tooltip")

var svg= d3.select('.let').append('svg').attr('width',w).attr('height',h).append('g').attr('transform','translate('+padding+','+padding+')')

var leg_text=['15%','25%','50%','60%','70%','100%'];
var colors=['#B2DFDB','#80CBC4','#4DB6AC','#009688','#00796B','#004D40'];
var counties= topojson.feature(us,us.objects.counties)

education.forEach((d)=>{
    d.fips= +d.fips;
    d.bachelorsOrHigher= +d.bachelorsOrHigher;
      })

var dataByCountyByState = d3.nest()
.key((d)=>d.fips)
.object(education)

counties.features.forEach((county)=>{
       county.properties.states=dataByCountyByState[+county.id]
})

// [2,10,15,20,25,30,35,40,45,50,77]
var color=d3.scaleThreshold().domain(d3.range(2.6,75.1,(75.1-2.6)/10)).range(['#E0F2F1','#B2DFDB','#80CBC4','#00BFA5','#4DB6AC','#26A69A','#009688','#00897B','#00796B','#00695C','#004D40']);

var map= d3.geoPath();

var countyShap=svg.append('g').attr('class','counties').selectAll('path')
.data(counties.features)
.enter()
.append('path')
.attr('class','county')
.attr('data-fips',(d)=>d.id)
.attr('data-education',(d)=>{
      if(d.properties.states[0].bachelorsOrHigher){
      return d.properties.states[0].bachelorsOrHigher
    }
    return 0
    }
)
.attr('d', map).on('mouseover',(d)=>{
    tooltip
    .style('opacity',1)
    .html(d.properties.states[0]? d.properties.states[0]['area_name'] + ', ' + d.properties.states[0]['state'] + ': ' +d.properties.states[0].bachelorsOrHigher + '%': 'nil').attr('data-education',d.properties.states[0].bachelorsOrHigher?d.properties.states[0].bachelorsOrHigher:0)
 
 
}) //tooltip
.on('mouseout',(d)=>{
    tooltip.transition()
    .duration(200)
    .style('opacity',0)
}) //tooltip
 .attr('fill',function(d) {
    if(d.properties.states[0].bachelorsOrHigher>0){
      return color(d.properties.states[0].bachelorsOrHigher)
    }
    return color(0)
    }) //fill
 
d3.select('.let').selectAll('path').data(counties.features).append('title').text((d)=>d.properties.states[0]? d.properties.states[0]['area_name'] + ', ' + d.properties.states[0]['state'] + ': \n' +d.properties.states[0].bachelorsOrHigher + '%': 'nil')//title

svg.append("path")
.datum(topojson.feature(us, us.objects.states, function(a, b) { return a !== b; }))
.attr("class", "states")
.attr("d", map)
//console.log(counties)

var legend = svg.append("g").attr("id", "legend");       
legend.selectAll('rect').data(colors).enter().append('rect').attr('x',(d,i)=>(i*35)+700).attr('y',0).attr('height',20).attr('width',35).attr('fill',(d)=>d).append('title').text((d,i)=>leg_text[i]+','+d);
legend.selectAll('text').data(colors).enter().append('text').text((d,i)=>leg_text[i]).attr('x',(d,i)=>(i*35)+700).attr('y',40);

}
}

