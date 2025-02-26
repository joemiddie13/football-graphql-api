module ApiFootball
  class DataImporter
    def initialize
      @client = ApiFootball::Client.new
    end

    def import_teams(league_id, season)
      response = @client.get_teams(league_id, season)

      if response[:success]
        teams_data = response[:data]["response"]
        imported_count = 0

        teams_data.each do |team_data|
          team_info = team_data["team"]

          team = Team.find_or_initialize_by(name: team_info["name"])
          team.update(
            country: team_info["country"],
            logo_url: team_info["logo"],
            founded: team_info["founded"]
          )

          imported_count += 1 if team.persisted?
        end

        { success: true, count: imported_count }
      else
        { success: false, error: response[:error] }
      end
    end

    def import_matches(league_id, season)
      response = @client.get_fixtures(league_id, season)

      if response[:success]
        fixtures_data = response[:data]["response"]
        imported_count = 0

        tournament = Tournament.find_or_create_by(
          name: "Champions League",
          season: season
        )

        fixtures_data.each do |fixture|
          home_team = Team.find_or_create_by(name: fixture["teams"]["home"]["name"])
          away_team = Team.find_or_create_by(name: fixture["teams"]["away"]["name"])

          match = Match.find_or_initialize_by(
            tournament: tournament,
            home_team: home_team,
            away_team: away_team,
            match_date: DateTime.parse(fixture["fixture"]["date"])
          )

          match.update(
            score_home: fixture["goals"]["home"],
            score_away: fixture["goals"]["away"]
          )

          imported_count += 1 if match.persisted?
        end

        { success: true, count: imported_count }
      else
        { success: false, error: response[:error] }
      end
    end
  end
end
