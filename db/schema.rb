# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_03_01_233620) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "matches", force: :cascade do |t|
    t.bigint "tournament_id", null: false
    t.bigint "home_team_id", null: false
    t.bigint "away_team_id", null: false
    t.datetime "match_date"
    t.integer "score_home"
    t.integer "score_away"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["away_team_id"], name: "index_matches_on_away_team_id"
    t.index ["home_team_id"], name: "index_matches_on_home_team_id"
    t.index ["tournament_id"], name: "index_matches_on_tournament_id"
  end

  create_table "players", force: :cascade do |t|
    t.bigint "team_id", null: false
    t.string "name", null: false
    t.string "position", null: false
    t.string "nationality"
    t.integer "age"
    t.integer "jersey_number"
    t.integer "goals", default: 0
    t.integer "assists", default: 0
    t.integer "appearances", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["team_id", "name"], name: "index_players_on_team_id_and_name", unique: true
    t.index ["team_id"], name: "index_players_on_team_id"
  end

  create_table "teams", force: :cascade do |t|
    t.string "name"
    t.string "country"
    t.string "logo_url"
    t.integer "founded"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tournaments", force: :cascade do |t|
    t.string "name"
    t.string "season"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "matches", "teams", column: "away_team_id"
  add_foreign_key "matches", "teams", column: "home_team_id"
  add_foreign_key "matches", "tournaments"
  add_foreign_key "players", "teams"
end
