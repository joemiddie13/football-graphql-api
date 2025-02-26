class Tournament < ApplicationRecord
  has_many :matches, dependent: :destroy

  validates :name, presence: true
  validates :season, presence: true

  def teams
    Team.joins("LEFT JOIN matches ON teams.id = matches.home_team_id OR teams.id = matches.away_team_id")
        .where(matches: { tournament_id: id })
        .distinct
  end
end
