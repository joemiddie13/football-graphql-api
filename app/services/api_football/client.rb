module ApiFootball
  class Client
    require 'net/http'
    require 'json'

    API_BASE_URL = 'https://v3.football.api-sports.io'

    def initialize
      @api_key = Rails.application.credentials.dig(:api_football, :api_key)

      if @api_key.nil?
        raise "API-FOOTBALL key not found in credentials. Please add it to your Rails credentials."
      end
    end

    def get_teams(league_id, season)
      make_request("/teams", { league: league_id, season: season })
    end

    def get_fixtures(league_id, season)
      make_request("/fixtures", { league: league_id, season: season })
    end

    def get_leagues
      make_request("/leagues")
    end

    def get_status
      make_request("/status")
    end

    def make_request(endpoint, params = {})
      url = URI("#{API_BASE_URL}#{endpoint}")
      url.query = URI.encode_www_form(params) if params.any?

      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true

      request = Net::HTTP::Get.new(url)
      # Use the correct headers for api-football.com
      request["x-apisports-key"] = @api_key

      begin
        response = http.request(request)

        if response.code.to_i == 200
          { success: true, data: JSON.parse(response.body) }
        else
          error_body = response.body.length > 0 ? " - Body: #{response.body}" : ""
          { success: false, error: "#{response.code} - #{response.message}#{error_body}" }
        end
      rescue => e
        { success: false, error: "Request failed: #{e.message}" }
      end
    end
  end
end
