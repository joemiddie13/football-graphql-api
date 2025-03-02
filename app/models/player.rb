class Player < ApplicationRecord
  belongs_to :team

  validates :name, presence: true
  validates :position, presence: true
  validates :team_id, presence: true

  enum position: {
    goalkeeper: 'Goalkeeper',
    defender: 'Defender',
    midfielder: 'Midfielder',
    forward: 'Forward'
  }
end
