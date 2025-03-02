module ApiFootball
  class DataImporter
    def initialize
      @client = ApiFootball::Client.new
    end

    def import_players(team_id, season = "2023")
      team = Team.find(team_id)

      # Call the API endpoint for players
      response = @client.get_players(team_id, season)

      if response[:success]
        players_data = response[:data]["response"]
        imported_count = 0

        players_data.each do |player_data|
          player_info = player_data["player"]
          statistics = player_data["statistics"][0] # Usually first item contains current season stats

          # Map position from API to our format
          position = case player_info["position"]
                     when "Goalkeeper" then "Goalkeeper"
                     when "Defender" then "Defender"
                     when "Midfielder" then "Midfielder"
                     when "Attacker" then "Forward"
                     else "Unknown"
                     end

          # Create or update player
          player = Player.find_or_initialize_by(
            team: team,
            name: player_info["name"]
          )

          player.update!(
            position: position,
            nationality: player_info["nationality"],
            age: player_info["age"],
            jersey_number: player_info["number"] || 0,
            goals: statistics&.dig("goals", "total") || 0,
            assists: statistics&.dig("goals", "assists") || 0,
            appearances: statistics&.dig("games", "appearences") || 0
          )

          imported_count += 1 if player.persisted?
        end

        { success: true, count: imported_count }
      else
        { success: false, error: response[:error] }
      end
    rescue StandardError => e
      { success: false, error: e.message }
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
