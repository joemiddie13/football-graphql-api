# db/seeds.rb

# Clear existing data
puts "Clearing existing data..."
Match.destroy_all
Team.destroy_all
Tournament.destroy_all

# Create teams
puts "Creating teams..."
teams = [
  { name: 'FC Barcelona', country: 'Spain', logo_url: 'https://example.com/barcelona.png', founded: 1899 },
  { name: 'Real Madrid', country: 'Spain', logo_url: 'https://example.com/madrid.png', founded: 1902 },
  { name: 'Bayern Munich', country: 'Germany', logo_url: 'https://example.com/bayern.png', founded: 1900 },
  { name: 'Manchester City', country: 'England', logo_url: 'https://example.com/city.png', founded: 1880 },
  { name: 'Paris Saint-Germain', country: 'France', logo_url: 'https://example.com/psg.png', founded: 1970 },
  { name: 'Juventus', country: 'Italy', logo_url: 'https://example.com/juventus.png', founded: 1897 },
  { name: 'Liverpool', country: 'England', logo_url: 'https://example.com/liverpool.png', founded: 1892 },
  { name: 'Chelsea', country: 'England', logo_url: 'https://example.com/chelsea.png', founded: 1905 }
]

created_teams = teams.map { |team_data| Team.create!(team_data) }

# Create tournament
puts "Creating tournament..."
tournament = Tournament.create!(
  name: 'UEFA Champions League',
  season: '2024-2025'
)

# Create matches
puts "Creating matches..."
matches_data = [
  {
    home_team: created_teams[0],
    away_team: created_teams[1],
    match_date: DateTime.new(2024, 10, 25, 20, 0),
    score_home: 3,
    score_away: 1
  },
  {
    home_team: created_teams[2],
    away_team: created_teams[3],
    match_date: DateTime.new(2024, 10, 26, 20, 0),
    score_home: 2,
    score_away: 2
  },
  {
    home_team: created_teams[4],
    away_team: created_teams[5],
    match_date: DateTime.new(2024, 11, 5, 20, 0),
    score_home: 1,
    score_away: 0
  },
  {
    home_team: created_teams[6],
    away_team: created_teams[7],
    match_date: DateTime.new(2024, 11, 6, 20, 0),
    score_home: nil,
    score_away: nil
  }
]

matches_data.each do |match_data|
  tournament.matches.create!(match_data)
end

puts "Seed data created successfully!"
