class SensorLogger
  valueNames: ['light', 'sound', 'temp', 'humid']
  max: {light: 0.65039062, sound: 0.19921875, temp: 28.8156, humid: 49.851}
  min: {light: 0.00976562, sound: 0.01464844, temp: 26.9387, humid: 34.3557}

  constructor: ->
    setInterval =>
      console.log  @min, @max
    , 1000

  log: (readings) ->
    for name in @valueNames
      @setMax(name, readings[name])
      @setMin(name, readings[name])

  setMax: (name, value) ->
    @max[name] ||= value
    @max[name] = Math.max(value, @max[name])

  setMin: (name, value) ->
    @min[name] ||= value
    @min[name] = Math.min(value, @min[name])
