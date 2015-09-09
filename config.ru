require 'grape'

class API < Grape::API
  format :json
  prefix :api

  put :status do
    { hello: "world" }
  end
end

run API
