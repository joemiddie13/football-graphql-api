# frozen_string_literal: true

module Types
  class BaseConnection < GraphQL::Types::Relay::BaseConnection
    field :total_count, Integer, null: false,
      description: "Total number of items in the connection"

    def total_count
      object.items.count
    end
  end
end
