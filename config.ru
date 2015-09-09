require 'grape'
require 'sinatra'
require 'slim'

CONFIG = {
  climate: {
    temperature: [],
    humidity: [],
  }
}

class API < Grape::API
  format :json
  prefix :api

  params do
    requires :time, type: DateTime, desc: "device timestamp"
    requires :climate, type: Hash, desc: "Climate data" do
      requires :temperature, type: Float
      requires :humidity, type: Float
    end
  end

  put :status do
    puts params.inspect

    actions = {}

    [:temperature, :humidity].each do |sensor_type|
      CONFIG[:climate][sensor_type].each do |config|
        if config[:test].call(params[:climate][sensor_type])
          puts "Matched #{sensor_type}"
          actions.merge!(config[:actions])
        end
      end
    end

    puts "=> #{ actions.inspect }"

    actions
  end

  params do
    optional :climate, type: Hash, desc: "Climate data" do
      optional :temperature, type: Float
      optional :humidity, type: Float
    end
  end

  put :config do
    if params[:climate][:temperature]
      CONFIG[:climate][:temperature].push({
        test: ->(value) { params[:climate][:temperature] < value },
        actions: {
          servo1: -90
        }
      })

      CONFIG[:climate][:temperature].push({
        test: ->(value) { params[:climate][:temperature] > value },
        actions: {
          servo1: 90
        }
      })
    end

    if params[:climate][:humidity]
      CONFIG[:climate][:humidity].push({
        test: ->(value) { params[:climate][:humidity] < value },
        actions: {
          servo2: -90
        }
      })

      CONFIG[:climate][:humidity].push({
        test: ->(value) { params[:climate][:humidity] > value },
        actions: {
          servo2: 90
        }
      })
    end
  end
end

class Web < Sinatra::Base
  get '/' do
    slim :index
  end
end

run Rack::Cascade.new [API, Web]

#{
#  climate: {
#    temperature: [
#      {
#        test: function(value) { },
#        actions: { }
#      },
#
#      {
#        test: function(value) { },
#        actions: { }
#      }
#    ]
#  }
#}
