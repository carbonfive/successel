require 'grape'

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
    params
  end
end

run API
