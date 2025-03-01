namespace :football do
  desc "Clean up duplicate teams and fix logos"
  task cleanup_teams: :environment do
    # Mapping of seed names to API names
    team_mappings = {
      "Bayern Munich" => "Bayern München",
      "Paris Saint-Germain" => "Paris Saint Germain",
      "AFC Ajax" => ["Ajax Amsterdam", "Ajax"],
      "Liverpool" => "Liverpool",
      "Chelsea" => "Chelsea",
      "Juventus" => "Juventus",
      "Real Madrid" => "Real Madrid"
    }

    puts "🧹 Cleaning up duplicate teams..."

    team_mappings.each do |seed_name, api_names|
      api_names = [api_names].flatten # Convert to array if it's not already

      # Find the seed team
      seed_team = Team.find_by(name: seed_name)
      next unless seed_team

      # Look for API teams with the corresponding names
      api_teams = api_names.map { |name| Team.where("name ILIKE ?", "%#{name}%").where.not(id: seed_team.id) }.flatten

      if api_teams.any?
        api_team = api_teams.first
        puts "Found duplicate: #{seed_name} (ID: #{seed_team.id}) and #{api_team.name} (ID: #{api_team.id})"

        # Update the seed team with the API team's logo
        if api_team.logo_url.present? && !api_team.logo_url.include?("example.com")
          seed_team.update(logo_url: api_team.logo_url)
          puts "✅ Updated #{seed_name} with logo from #{api_team.name}: #{api_team.logo_url}"

          # Transfer matches from API team to seed team
          match_count = 0
          Match.where(home_team_id: api_team.id).update_all(home_team_id: seed_team.id)
          match_count += Match.where(home_team_id: api_team.id).count
          Match.where(away_team_id: api_team.id).update_all(away_team_id: seed_team.id)
          match_count += Match.where(away_team_id: api_team.id).count
          puts "  Transferred #{match_count} matches from #{api_team.name} to #{seed_name}"

          # Delete the API team (optional - uncomment if you want to remove duplicates)
          # api_team.destroy
          # puts "  Deleted duplicate team #{api_team.name}"
        else
          puts "⚠️ No valid logo found for #{api_team.name}"
        end
      else
        puts "No API equivalent found for #{seed_name}"
      end
    end

    # Fix any remaining teams with example.com logos
    example_teams = Team.where("logo_url LIKE ?", "%example.com%")
    puts "\n🖼️ Fixing remaining #{example_teams.count} teams with placeholder logos..."

    example_teams.each do |team|
      # Try to find a better matching team
      better_team = Team.where("name ILIKE ?", "%#{team.name.split.first}%")
                        .where.not(id: team.id)
                        .where("logo_url NOT LIKE ?", "%example.com%")
                        .first

      if better_team
        team.update(logo_url: better_team.logo_url)
        puts "✅ Updated #{team.name} with logo from #{better_team.name}: #{better_team.logo_url}"
      else
        puts "⚠️ No better match found for #{team.name}"
      end
    end

    puts "\n✨ Team cleanup complete!"
  end
end
