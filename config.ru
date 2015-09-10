require 'grape'
require 'sinatra'
require 'slim'
require 'active_support/json'

CONFIG = {
  'climate' => {
    'temperature' => [],
    'humidity' => [],
  }
}

module Activator
  @@active = false

  def active?
    @@active
  end

  def activate!
    @@active = true
  end
end

module ControlsTester
  @@test = []

  def test
    @@test
  end

  def reset_test
    @@test = []
  end

  def set_test controls
    @@test += controls
  end
end

class API < Grape::API
  format :json
  prefix :api

  helpers Activator
  helpers ControlsTester

  params do
    requires :time, type: Integer, desc: "device timestamp"
    requires :climate, type: Hash, desc: "Climate data" do
      requires :temperature, type: Float
      requires :humidity, type: Float
    end
  end

  put :status do
    actions = {}

    if test.any?
      test.each do |k|
        actions[k] = 'test'
      end

      reset_test
    end

    if active?
      ['temperature', 'humidity'].each do |sensor_type|
        CONFIG['climate'][sensor_type].each do |config|
          if config['test'].call(params['climate'][sensor_type])
            puts "Matched #{sensor_type}"
            actions.merge!(config['actions'])
          end
        end
      end
    end

    puts "=> #{ actions.inspect }"

    actions
  end

  params do
    requires :sensor, type: String, desc: 'The sensor to configure'
    requires :measurement, type: String, desc: 'The measurement to monitor'
    requires :value, type: String, desc: 'The triggering value'
    requires :test, type: String, desc: 'The type of test'
  end

  put :config do
    sensor = params[:sensor]
    measurement = params[:measurement]
    threshold = params[:value].to_f
    actions = params[:actions]
    test = case params[:test].downcase
      when "lt"
        ->(value) { value < threshold }
      when "gt"
        ->(value) { value > threshold }
      when "eq"
        ->(value) { value == threshold }
      end

    CONFIG[sensor][measurement].push('test' => test, 'actions' => actions)
  end

  params do
    requires :controls, type: Array[String], desc: "Controls to test"
  end

  put :test do
    set_test params[:controls]
  end

  put :activate do
    activate!
  end
end

class Web < Sinatra::Base
  get '/' do
    slim :index
  end

  get '/setup' do
    slim :setup
  end

  get '/test' do
    slim :test
  end

  get '/configure' do
    slim :configure
  end

  get '/go' do
    slim :go
  end
end

run Rack::Cascade.new [API, Web]
