var barGap = 20;
var monthTickAmount = 1;
var weekTickAmount = 4;

/* Create a bar chart of the data in monthDomain grouped by month */
function monthlyBarChart(location, monthDimension, monthDomain) {
  var monthGroup = monthDimension.group().reduceCount().orderNatural();

  var monthChart = dc.barChart(location)
    .width(900)
    .height(250)
    .gap(barGap)
    .dimension(monthDimension)
    .group(monthGroup)
    .centerBar(true)
    .x(d3.time.scale().domain(monthDomain))
    .xUnits(d3.time.months)
    .margins({top: 10, right: 50, bottom: 30, left: 60});

  monthChart.xAxis().ticks(d3.time.months, monthTickAmount)
    .tickFormat(d3.time.format("%b %Y"));
}

function commChart(location, communityDimension) {
  var communityGroup = communityDimension.group().reduceCount().orderNatural();

  var commChart = dc.pieChart(location)
    .width(300)
    .height(200)
    .radius(100)
    .dimension(communityDimension)
    .group(communityGroup)
    .colors(['#F1A82F', '#F1CD91']);
}

function percentMergedChart(location, mergeDimension) {
  var mergeGroup = mergeDimension.group().reduceCount().orderNatural();

  var mergeChart = dc.pieChart(location)
    .width(300)
    .height(200)
    .radius(100)
    .dimension(mergeDimension)
    .group(mergeGroup)
    .colors(['#7D64AC', '#501FAC']);
}

function perRepositoryChart(location, repoDimension) {
  var repoGroup = repoDimension.group().reduceCount().orderNatural();

  var repoChart = dc.rowChart(location)
    .width(400)
    .height(200)
    .group(repoGroup)
    .dimension(repoDimension)
    .colors(['#501FAC', '#6742AC', '#7D64AC', '#9487AC']);

  repoChart.xAxis().ticks(5);
}

function pullRequestsPerWeek(location, weekDimension, weekDomain) {

  var weekGroup = weekDimension.group().reduceCount().orderNatural();

  var weekChart = dc.barChart(location)
    .width(900)
    .height(250)
    .gap(2)
    .dimension(weekDimension)
    .group(weekGroup)
    .centerBar(true)
    .x(d3.time.scale().domain(weekDomain))
    .xUnits(d3.time.weeks)
    .margins({top: 10, right: 50, bottom: 30, left: 60});

  weekChart.xAxis().ticks(d3.time.weeks, weekTickAmount)
    .tickFormat(d3.time.format("%m/%y"));
}

function lifetimesPerMonth(location, monthDimension, monthDomain) {
  var lifetimeGroup = monthDimension.group().reduce(
      function(p,v){
        ++p.count;
        p.sum_ttl += v.ttl;
        p.avg = p.sum_ttl / p.count;
        return p;
      },
      function(p,v){
        --p.count;p.sum_ttl -= v.ttl;
        p.avg = p.sum_ttl / p.count;
        return p;
      },
      function(){
        return {count: 0, sum_ttl: 0, avg: 0};
      }
      );

  var lifetimes = dc.lineChart(location)
    .width(900)
    .height(250)
    .dimension(monthDimension)
    .group(lifetimeGroup)
    .x(d3.time.scale().domain(monthDomain))
    .xUnits(d3.time.months)
    .renderArea(true)
    .margins({top: 10, right: 50, bottom: 30, left: 60});

  lifetimes.xAxis().ticks(d3.time.months, monthTickAmount)
    .tickFormat(d3.time.format("%b %Y"));

  lifetimes.valueAccessor(function(p) { return p.value.avg; });
}

var renderFunction = function(dataset) {
  var dateFormat = d3.time.format.utc('%Y-%m-%dT%H:%M:%SZ');
  var dataset = dataset.map(function(d){
    return {'month': d3.time.month(dateFormat.parse(d.close_time)),
      'repo': d.repo_name,
      'ttl': d.ttl,
      'week': d3.time.week(dateFormat.parse(d.close_time)),
      'community': d.community,
      'merged': d.merged};
  });

  var monthDomain = d3.extent(dataset, function(d){return d.month;});
  var weekDomain = d3.extent(dataset, function(d){return d.week;});

  var pull_requests = crossfilter(dataset);
  var all = pull_requests.groupAll();

  var monthDimension = pull_requests.dimension(function(d){return d.month;});

  var repoDimension = pull_requests.dimension(function(d){return d.repo;});

  var weekDimension = pull_requests.dimension(function(d){return d.week;});

  var communityDimension = pull_requests.dimension(function(d){return d.community;});

  var mergeDimension = pull_requests.dimension(function(d){return d.merged;});

  monthlyBarChart("#per-month", monthDimension, monthDomain);

  commChart("#community", communityDimension);

  percentMergedChart("#merged", mergeDimension);

  perRepositoryChart("#repo-names", repoDimension);

  pullRequestsPerWeek("#per-week", weekDimension, weekDomain);

  lifetimesPerMonth("#lifetimes", monthDimension, monthDomain);

  dc.renderAll();

  $('#inspectButton1').popover();
  $('#inspectButton2').popover();
  $('#inspectButton3').popover();
  $('#inspectButton4').popover();
  $('#inspectButton5').popover();
  $('#inspectButton6').popover();
};

d3.json("/data/puppet_pulls", renderFunction);

var adjustGraphs = function(){
  var value = graphSlider.getValue();
  var startDate = new Date();
  var dateString;
  console.log(value);
  switch(value) {
    //0 = all time
    case 0:
      startDate.setFullYear(2011, 08, 01);
      barGap = 2;
      monthTickAmount = 2;
      weekTickAmount = 8;
      break;
    // 1 = last 2 years
    case 1:
      startDate.setFullYear(startDate.getFullYear() - 2);
      barGap = 2;
      monthTickAmount = 2;
      weekTickAmount = 6;
      break;
    // 2 = last year
    case 2:
      startDate.setFullYear(startDate.getFullYear() - 1);
      barGap = 20;
      monthTickAmount = 1;
      weekTickAmount = 4;
      break;
    //3 = last 6 months
    case 3:
      startDate.setMonth(startDate.getMonth() - 9);
      barGap = 50;
      monthTickAmount = 1;
      weekTickAmount = 4;
      break;
    //4 = last 3 months
    case 4:
      startDate.setMonth(startDate.getMonth() - 3);
      barGap = 300;
      monthTickAmount = 1;
      weekTickAmount = 4;
      break;
  }
  dateString = startDate.toString('yyyy-MM-dd');
  d3.json("/data/puppet_pulls?start=" + dateString, renderFunction);
};

