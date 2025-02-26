source "https://rubygems.org"

# Core Rails components
gem "rails", "~> 8.0.0"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"

# Asset Pipeline and GraphQL components
gem "sprockets", "~> 4.0"
gem "sprockets-rails"
gem "graphql"
gem "graphiql-rails"
gem "rack-cors"
gem "httparty"

# Caching and Performance
gem "bootsnap", require: false
gem "redis"

# Development and Testing tools
group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
  gem "pry-rails"
end

# Windows compatibility
gem "tzinfo-data", platforms: %i[ windows jruby ]
