class CreatePlayers < ActiveRecord::Migration[8.0]
  def change
    create_table :players do |t|
      t.references :team, null: false, foreign_key: true
      t.string :name, null: false
      t.string :position, null: false
      t.string :nationality
      t.integer :age
      t.integer :jersey_number
      t.integer :goals, default: 0
      t.integer :assists, default: 0
      t.integer :appearances, default: 0

      t.timestamps
    end

    add_index :players, [:team_id, :name], unique: true
  end
end
