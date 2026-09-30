"""Python Deep Dive: one module per topic, in the order they appear on the site.
See _blocks.py for the schema."""
from . import (gil, memory, bytecode, object_model, descriptors, metaclasses,
               mro, decorators, context_managers, async_internals)

TOPICS = [
    gil.TOPIC,
    memory.TOPIC,
    bytecode.TOPIC,
    object_model.TOPIC,
    descriptors.TOPIC,
    metaclasses.TOPIC,
    mro.TOPIC,
    decorators.TOPIC,
    context_managers.TOPIC,
    async_internals.TOPIC,
]
