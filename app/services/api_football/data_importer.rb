module ApiFootball
  class DataImporter
    def initialize
      @client = ApiFootball::Client.new
    end

    def import_players(team_id, season = "2023")
      # Add validation for team_id
      if team_id.nil?
        puts "Error: team_id is nil"
        return { success: false, error: "Team ID cannot be nil" }
      end

      begin
        team = Team.find(team_id)
        puts "Found team: #{team.name} (ID: #{team_id})"

        # Extract API team ID from logo URL if available
        api_team_id = team_id
        if team.logo_url.present? && team.logo_url.match(/teams\/(\d+)/)
          api_team_id = team.logo_url.match(/teams\/(\d+)/)[1]
          puts "Using API team ID #{api_team_id} extracted from logo URL"
        else
          puts "Warning: Using database ID as API ID (may not match API's team identifier)"
        end

        # Debug API call parameters
        puts "Calling API with team_id: #{api_team_id} and season: #{season}"

        # Initialize counters for summary
        imported_count = 0
        total_players_in_api = 0
        page = 1
        all_players_data = []

        # Handle pagination
        loop do
          # Call the API endpoint for players with pagination
          response = @client.make_request("/players", { team: api_team_id, season: season, page: page })
          puts "API response for page #{page}: success=#{response[:success]}"

          break unless response[:success]

          players_data = response[:data]["response"]
          total_players_in_api += players_data.length
          puts "Processing #{players_data.length} players from API (page #{page})"

          # Store all players data
          all_players_data.concat(players_data)

          # Check if we've reached the last page
          paging = response[:data]["paging"]
          if paging && paging["current"] < paging["total"]
            page += 1
          else
            break
          end
        end

        puts "Total players found in API: #{total_players_in_api}"

        # Process all collected player data
        all_players_data.each do |player_data|
          begin
            player_info = player_data["player"]
            puts "Processing player: #{player_info['name'] || 'Unknown name'}, ID: #{player_info['id'] || 'Unknown ID'}"

            # Log all available fields for debugging
            puts "Player info fields available: #{player_info.keys.join(', ')}"
            puts "Nationality from API: #{player_info['nationality'] || 'NOT PROVIDED'}"

            statistics = player_data["statistics"].first if player_data["statistics"].is_a?(Array) && !player_data["statistics"].empty?

            # Map position from API to our format (with better error handling)
            position = "Unknown"
            if player_info["position"]
              position = case player_info["position"]
                         when "Goalkeeper" then "Goalkeeper"
                         when "Defender" then "Defender"
                         when "Midfielder" then "Midfielder"
                         when "Attacker" then "Forward"
                         else "Unknown"
                         end
            end

            puts "Player: #{player_info['name']}, Position from API: #{player_info['position'] || 'NOT PROVIDED'}, Mapped to: #{position}"

            # Create or update player with safer data extraction
            player = Player.find_or_initialize_by(
              team: team,
              name: player_info["name"]
            )

            player.update!(
              position: position,
              nationality: player_info["nationality"],
              age: player_info["age"],
              jersey_number: player_info.dig("number") || 0,
              goals: statistics&.dig("goals", "total") || 0,
              assists: statistics&.dig("goals", "assists") || 0,
              appearances: statistics&.dig("games", "appearences") || 0
            )

            imported_count += 1 if player.persisted?
          rescue => e
            puts "Error processing player: #{e.message}"
          end
        end

        { success: true, count: imported_count }
      rescue StandardError => e
        puts "Exception occurred: #{e.message}"
        puts e.backtrace.join("\n")
        { success: false, error: e.message }
      end
    end

    def import_teams(league_id, season)
      response = @client.get_teams(league_id, season)

      if response[:success]
        teams_data = response[:data]["response"]
        imported_count = 0
        Rails.logger.info "Received #{teams_data.length} teams from API"

        teams_data.each do |team_data|
          team_info = team_data["team"]
          venue_info = team_data["venue"]

          # Create or update team with proper data
          team = Team.find_or_initialize_by(name: team_info["name"])

          team.update!(
            country: team_info["country"] || "Unknown",
            logo_url: team_info["logo"],
            founded: team_info["founded"]
          )

          imported_count += 1 if team.persisted?
          Rails.logger.info "Imported team: #{team.name} (#{team.country}) with logo: #{team.logo_url}"
        end

        { success: true, count: imported_count }
      else
        Rails.logger.error "API Error: #{response[:error]}"
        { success: false, error: response[:error] }
      end
    rescue StandardError => e
      Rails.logger.error "Import error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      { success: false, error: e.message }
    end

    def import_matches(league_id, season)
      response = @client.get_fixtures(league_id, season)

      if response[:success]
        fixtures_data = response[:data]["response"]
        imported_count = 0
        Rails.logger.info "Received #{fixtures_data.length} fixtures from API"

        tournament = Tournament.find_or_create_by(
          name: "UEFA Champions League",
          season: "2023-2024"
        )

        fixtures_data.each do |fixture|
          # Extract fixture information
          fixture_id = fixture["fixture"]["id"]
          match_date = DateTime.parse(fixture["fixture"]["date"])
          status = fixture["fixture"]["status"]["short"]

          # Find or create teams
          home_team_name = fixture["teams"]["home"]["name"]
          away_team_name = fixture["teams"]["away"]["name"]

          home_team = Team.find_or_create_by(name: home_team_name) do |t|
            t.country = "Unknown" # Will be updated by import_teams
            t.logo_url = fixture["teams"]["home"]["logo"]
          end

          away_team = Team.find_or_create_by(name: away_team_name) do |t|
            t.country = "Unknown" # Will be updated by import_teams
            t.logo_url = fixture["teams"]["away"]["logo"]
          end

          # Only include scores if the match is finished or in progress
          score_home = nil
          score_away = nil

          if ["FT", "AET", "PEN", "1H", "2H", "HT"].include?(status)
            score_home = fixture["goals"]["home"]
            score_away = fixture["goals"]["away"]
          end

          # Create or update match
          match = Match.find_or_initialize_by(
            tournament: tournament,
            home_team: home_team,
            away_team: away_team,
            match_date: match_date
          )

          match.update!(
            score_home: score_home,
            score_away: score_away
          )

          imported_count += 1 if match.persisted?
          Rails.logger.info "Imported match: #{home_team.name} vs #{away_team.name} on #{match_date}"
        end

        { success: true, count: imported_count }
      else
        Rails.logger.error "API Error: #{response[:error]}"
        { success: false, error: response[:error] }
      end
    rescue StandardError => e
      Rails.logger.error "Import error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      { success: false, error: e.message }
    end
  end
end
