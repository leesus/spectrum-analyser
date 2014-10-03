function SpectrumAnalyserView() {
  var vis = d3.select('#visualisation').append('svg');

  this.width = 1024;
  this.height = 500;
  this.svg = d3.select('svg')
    .attr('height', this.height)
    .attr('width', this.width)
    .append('g')
      .attr('transform', 'translate(0,10)');

  this.draw([]);
}

SpectrumAnalyserView.prototype.draw = function(data) {
  var y = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([this.height - 20, 0]);

  var line = d3.svg.line()
    .x(function(d, i) { return i; })
    .y(function(d) { return y(d); })
    .interpolate('cardinal');

  if (!data.length) {
    this.path = this.svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', line);
  } else {
    this.path.transition()
      .ease('linear')
      .attr('d', line(data));
  }
};