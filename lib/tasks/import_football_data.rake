#!/usr/bin/env ruby
# lib/tasks/import_football_data.rake

namespace :football do
  desc "Import Champions League data from API-FOOTBALL"
  task import: :environment do
    # Constants for Champions League
    CHAMPIONS_LEAGUE_ID = 2  # API-FOOTBALL's ID for Champions League
    CURRENT_SEASON = "2023"

    importer = ApiFootball::DataImporter.new

    puts "🏆 Starting Champions League data import..."

    # Step 1: Import teams
    puts "\n📋 Importing teams..."
    result = importer.import_teams(CHAMPIONS_LEAGUE_ID, CURRENT_SEASON)

    if result[:success]
      puts "✅ Successfully imported #{result[:count]} teams"
    else
      puts "❌ Failed to import teams: #{result[:error]}"
      exit 1
    end

    # Step 2: Import tournament if it doesn't exist
    puts "\n📋 Setting up tournament..."
    tournament = Tournament.find_or_create_by(
      name: "UEFA Champions League",
      season: "2024-2025"
    )
    puts "✅ Tournament ready: #{tournament.name} (#{tournament.season})"

    # Step 3: Import matches
    puts "\n📋 Importing matches..."
    result = importer.import_matches(CHAMPIONS_LEAGUE_ID, CURRENT_SEASON)

    if result[:success]
      puts "✅ Successfully imported #{result[:count]} matches"
    else
      puts "❌ Failed to import matches: #{result[:error]}"
      exit 1
    end

    # Verify imported data
    puts "\n📊 Data Import Summary:"
    puts "   - #{Team.count} teams in database"
    puts "   - #{Tournament.count} tournaments in database"
    puts "   - #{Match.count} matches in database"
    puts "\n✅ Import completed successfully!"
  end

  desc "Test API-FOOTBALL connection"
  task test_api: :environment do
    puts "🔍 Testing API-FOOTBALL connection..."

    client = ApiFootball::Client.new
    result = client.get_status

    if result[:success]
      account_info = result[:data]["response"]
      puts "✅ API connection successful!"
      puts "📊 Account Information:"
      puts "   - Account: #{account_info['account']['firstname']} #{account_info['account']['lastname']}"
      puts "   - Subscription: #{account_info['subscription']['plan']}"
      puts "   - Requests: #{account_info['requests']['current']} / #{account_info['requests']['limit_day']}"
    else
      puts "❌ API connection failed: #{result[:error]}"
      exit 1
    end
  end
end
