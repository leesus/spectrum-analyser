require.config({
  baseUrl: 'js',
  paths: {
    d3: "http://d3js.org/d3.v3.min"
  },
  urlArgs: 'bust=' + (new Date()).getTime()
});