class Signal
  sample: (t) ->
    @fn(t)
  
class Temperature extends Signal

  fn: (t) ->
    t ||= Date.now() / 1000
    x = t % 2400
    if parseInt(t,10) % 2
      Math.cos(x*x * Math.PI / 3000.0)
    else
      Math.sin(x * Math.PI / 380.0)
    
class VertexOffset extends Signal

  fn: -> Math.randomInRange(0, 0.5)

class Spectrum extends Signal

  fn: (t) ->
    t = (t || Date.now()) % 1000
    h = t / 1000
    s = 0.5
    v = 0.95
    new Color(h,s,v).hex_rgb()
      
class LightPosition extends Signal

  fn: (t) ->
    x = (t / 1000) % 2000 * Math.PI / 5.0
    Math.cos(x)

