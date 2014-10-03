define(['d3'], function(d3) {
  
  function Visual(options) {
    options = options || {};

    var vis = d3.select(options.container || document.body).append('svg');

    this.type = options.type || 'frequency';

    this.width = options.width || 1024;
    this.height = options.height || 500;

    this.svg = d3.select('svg')
      .attr('height', this.height)
      .attr('width', this.width)
      .style({ margin: '0 auto', display: 'block' })
      .append('g')
        .attr('transform', 'translate(0,10)');

    this.draw([]);
  }

  Visual.prototype.draw = function(data, end) {
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
    } else if (end) {
      this.path.transition()
        .ease('linear')
        .attr('d', line(data));
    } else {
      this.path
        .data([data])
        .attr('d', line);
    }
  };

  return Visual;

});