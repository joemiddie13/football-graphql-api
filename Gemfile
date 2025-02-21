source "https://rubygems.org"

# Core Rails components
gem "rails", "~> 8.0.0"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"

# GraphQL and API components
gem "graphql"
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
  gem "graphiql-rails"
  gem "pry-rails"
end

# Windows compatibility - keeping this from the original
gem "tzinfo-data", platforms: %i[ windows jruby ]
