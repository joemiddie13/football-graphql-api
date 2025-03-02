module ApiFootball
  class Client
    require 'net/http'
    require 'json'

    API_BASE_URL = 'https://v3.football.api-sports.io'
    REQUEST_TIMEOUT = 10 # seconds

    def initialize
      @api_key = Rails.application.credentials.dig(:api_football, :api_key)

      if @api_key.nil?
        raise "API-FOOTBALL key not found in credentials. Please add it to your Rails credentials using 'rails credentials:edit'"
      end
    end

    def get_players(team_id, season = nil)
      params = { team: team_id }
      params[:season] = season if season

      make_request("/players", params)
    end

    def get_teams(league_id, season)
      make_request("/teams", { league: league_id, season: season })
    end

    def get_fixtures(league_id, season)
      make_request("/fixtures", { league: league_id, season: season })
    end

    def get_standings(league_id, season)
      make_request("/standings", { league: league_id, season: season })
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
      http.read_timeout = REQUEST_TIMEOUT
      http.open_timeout = REQUEST_TIMEOUT

      request = Net::HTTP::Get.new(url)
      request["x-apisports-key"] = @api_key

      # Add additional headers required by the API
      request["x-apisports-host"] = "v3.football.api-sports.io"

      Rails.logger.info "Making API request to: #{endpoint} with params: #{params.inspect}"

      begin
        response = http.request(request)

        # Parse the response
        if response.code.to_i == 200
          body = JSON.parse(response.body)

          # Check for API errors even with 200 status
          if body["errors"] && !body["errors"].empty?
            error_message = body["errors"].map { |k, v| "#{k}: #{v}" }.join(", ")
            Rails.logger.error "API Error: #{error_message}"
            return { success: false, error: error_message }
          end

          # Check for rate limiting
          if response["x-ratelimit-remaining"] && response["x-ratelimit-remaining"].to_i < 5
            Rails.logger.warn "API Rate Limit Warning: Only #{response["x-ratelimit-remaining"]} requests remaining"
          end

          return { success: true, data: body }
        else
          error_body = response.body.length > 0 ? " - Body: #{response.body}" : ""
          error_message = "#{response.code} - #{response.message}#{error_body}"
          Rails.logger.error "API Request Failed: #{error_message}"
          return { success: false, error: error_message }
        end
      rescue Timeout::Error
        Rails.logger.error "API Request Timeout: #{endpoint}"
        return { success: false, error: "Request timed out after #{REQUEST_TIMEOUT} seconds" }
      rescue => e
        Rails.logger.error "API Request Failed: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        return { success: false, error: "Request failed: #{e.message}" }
      end
    end
  end
end
