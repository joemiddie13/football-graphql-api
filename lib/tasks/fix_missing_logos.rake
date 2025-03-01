namespace :football do
  desc "Fix missing team logos by directly fetching from API-FOOTBALL"
  task fix_missing_logos: :environment do
    # Direct mapping of team names to their API-FOOTBALL IDs
    team_id_mapping = {
      "Liverpool" => 40,
      "Chelsea" => 49,
      "Juventus" => 496,
      "Real Madrid" => 541,
      "AFC Ajax" => 194,
      "Ajax Amsterdam" => 194, # Same as AFC Ajax
      "Barcelona" => 529,
      "Inter" => 505,
      "AC Milan" => 489
    }

    client = ApiFootball::Client.new

    puts "🔄 Fixing missing team logos..."

    team_id_mapping.each do |team_name, api_id|
      # Find the team in our database (case insensitive)
      team = Team.find_by("name ILIKE ?", "%#{team_name}%")

      if team.nil?
        puts "⚠️ Team not found in database: #{team_name}"
        next
      end

      if !team.logo_url.include?("example.com")
        puts "✅ Team #{team.name} already has a proper logo: #{team.logo_url}"
        next
      end

      puts "🔍 Fetching logo for #{team.name} (API ID: #{api_id})..."

      # Get team data from API
      response = client.make_request("/teams", { id: api_id })

      if response[:success] && response[:data]["response"] && response[:data]["response"].length > 0
        team_data = response[:data]["response"][0]["team"]
        logo_url = team_data["logo"]

        if logo_url.present?
          # Update team with real logo URL
          team.update(logo_url: logo_url)
          puts "✅ Updated #{team.name} logo: #{logo_url}"
        else
          puts "❌ No logo URL returned for #{team.name}"
        end
      else
        puts "❌ Failed to get data for #{team.name} (API ID: #{api_id})"
        if response[:error]
          puts "   Error: #{response[:error]}"
        end
      end

      # Sleep to avoid API rate limiting
      sleep(1)
    end

    puts "\n✨ Logo update complete!"
  end
end
