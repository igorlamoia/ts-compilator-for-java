from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model que aceita snake_case internamente e serializa como camelCase."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,   # aceita snake_case nos inputs (útil nos testes)
        from_attributes=True,    # compatível com SQLAlchemy
    )
