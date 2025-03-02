namespace :football do
  desc "Import players for all teams"
  task import_players: :environment do
    importer = ApiFootball::DataImporter.new
    season = "2023"  # Specify the season

    puts "🧍 Importing players for all teams for season #{season}..."
    team_count = 0
    player_count = 0

    Team.find_each do |team|
      puts "Importing players for #{team.name}..."
      # Make sure to pass the team.id here:
      result = importer.import_players(team.id, season)

      if result[:success]
        team_count += 1
        player_count += result[:count]
        puts "✅ Imported #{result[:count]} players for #{team.name}"
      else
        puts "❌ Failed to import players for #{team.name}: #{result[:error]}"
      end

      # Sleep longer to avoid rate limiting
      puts "Waiting 7 seconds to avoid rate limits..."
      sleep(7)  # Increased sleep time to avoid rate limiting
    end

    puts "\n✅ Import completed: Added players for #{team_count} teams (#{player_count} players total)"
  end

  # The single team import task
  desc "Import players for a specific team"
  task :import_team_players, [:team_id] => :environment do |t, args|
    team_id = args[:team_id]
    season = "2023"  # Specify the season

    if team_id.blank?
      puts "❌ Error: Please provide a team ID"
      puts "Usage: rails football:import_team_players[team_id]"
      exit 1
    end

    team = Team.find_by(id: team_id)
    unless team
      puts "❌ Error: Team with ID #{team_id} not found"
      exit 1
    end

    puts "🧍 Importing players for #{team.name} for season #{season}..."
    importer = ApiFootball::DataImporter.new
    # Make sure to pass BOTH team.id and season here:
    result = importer.import_players(team.id, season)

    if result[:success]
      puts "✅ Imported #{result[:count]} players for #{team.name}"
    else
      puts "❌ Failed to import players for #{team.name}: #{result[:error]}"
    end
  end
end
